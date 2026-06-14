import {
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs, addDoc, deleteDoc,
  serverTimestamp, query, orderBy, limit,
} from 'firebase/firestore';
import { db } from './config';

// ─── Helpers ───────────────────────────────────────────────
const userRef = (uid) => doc(db, 'users', uid);
const subRef = (uid, sub) => doc(db, 'users', uid, sub, 'data');
const historyCol = (uid) => collection(db, 'users', uid, 'history');

// ─── User Profile ──────────────────────────────────────────
export const createUserProfile = async (uid, profile) => {
  await setDoc(userRef(uid), { profile }, { merge: true });
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(userRef(uid));
  return snap.exists() ? snap.data().profile || null : null;
};

export const updateUserProfile = async (uid, updates) => {
  await setDoc(userRef(uid), { profile: updates }, { merge: true });
};

// ─── Goals ─────────────────────────────────────────────────
export const getGoals = async (uid) => {
  const snap = await getDoc(userRef(uid));
  return snap.exists() ? snap.data().goals || null : null;
};

export const updateGoals = async (uid, goals) => {
  await setDoc(userRef(uid), { goals }, { merge: true });
};

// ─── Daily Goals ───────────────────────────────────────────
export const getDailyGoals = async (uid) => {
  const snap = await getDoc(userRef(uid));
  return snap.exists() ? snap.data().dailyGoals || null : null;
};

export const updateDailyGoals = async (uid, dailyGoals) => {
  await setDoc(userRef(uid), { dailyGoals }, { merge: true });
};

// ─── Active Plan ───────────────────────────────────────────
export const getActivePlan = async (uid) => {
  const snap = await getDoc(userRef(uid));
  return snap.exists() ? snap.data().activePlan || [] : [];
};

export const updateActivePlan = async (uid, plan) => {
  await setDoc(userRef(uid), { activePlan: plan }, { merge: true });
};

// ─── Active Session ────────────────────────────────────────
export const getActiveSession = async (uid) => {
  const snap = await getDoc(userRef(uid));
  return snap.exists() ? snap.data().activeSession || null : null;
};

export const saveActiveSession = async (uid, session) => {
  await setDoc(userRef(uid), { activeSession: session }, { merge: true });
};

export const clearActiveSession = async (uid) => {
  await setDoc(userRef(uid), { activeSession: null }, { merge: true });
};

// ─── Workout History ───────────────────────────────────────
export const getHistory = async (uid) => {
  const q = query(historyCol(uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), firestoreId: d.id }));
};

export const addHistoryEntry = async (uid, session) => {
  const ref = await addDoc(historyCol(uid), {
    ...session,
    createdAt: session.createdAt || serverTimestamp(),
  });
  return ref.id;
};

export const deleteHistoryEntry = async (uid, firestoreId) => {
  await deleteDoc(doc(db, 'users', uid, 'history', firestoreId));
};

// ─── Custom Exercises ──────────────────────────────────────
export const getCustomExercises = async (uid) => {
  const snap = await getDoc(userRef(uid));
  return snap.exists() ? snap.data().customExercises || {} : {};
};

export const updateCustomExercises = async (uid, customExercises) => {
  await setDoc(userRef(uid), { customExercises }, { merge: true });
};

// ─── Export / Import Cloud Data Backups ───────────────────
export const exportUserData = async (uid) => {
  const userSnap = await getDoc(userRef(uid));
  const userData = userSnap.exists() ? userSnap.data() : {};
  const historyData = await getHistory(uid);
  return {
    version: 'v6-firebase',
    timestamp: Date.now(),
    profile: userData.profile || null,
    goals: userData.goals || null,
    dailyGoals: userData.dailyGoals || null,
    activePlan: userData.activePlan || [],
    activeSession: userData.activeSession || null,
    customExercises: userData.customExercises || {},
    history: historyData,
  };
};

export const importUserData = async (uid, backup) => {
  if (!backup || typeof backup !== 'object') throw new Error('Invalid backup data');

  const safeParse = (val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch (e) {
        return val;
      }
    }
    return val;
  };

  // Resolve keys for new export schema OR legacy localStorage keys
  const historyRaw = safeParse(backup.history || backup.gym_history);
  const goalsRaw = safeParse(backup.goals || backup.gym_goals);
  const dailyGoalsRaw = safeParse(backup.dailyGoals || backup.gym_daily_goals || backup.gym_target_goals);
  const customRaw = safeParse(backup.customExercises || backup.custom || backup.gym_custom_exercises);
  const planRaw = safeParse(backup.activePlan || backup.plan || backup.gym_active_plan);
  const sessionRaw = safeParse(backup.activeSession || backup.session || backup.gym_active_session);
  const profileRaw = safeParse(backup.profile);

  const updates = {};
  if (profileRaw) updates.profile = profileRaw;
  if (goalsRaw) updates.goals = goalsRaw;
  if (dailyGoalsRaw) updates.dailyGoals = dailyGoalsRaw;
  if (planRaw) updates.activePlan = planRaw;
  if (sessionRaw !== undefined) updates.activeSession = sessionRaw;
  if (customRaw) updates.customExercises = customRaw;

  if (Object.keys(updates).length > 0) {
    await setDoc(userRef(uid), updates, { merge: true });
  }

  // Smart history merge (avoid duplicates)
  if (Array.isArray(historyRaw) && historyRaw.length > 0) {
    const currentHistory = await getHistory(uid);
    const existingKeys = new Set(currentHistory.map(h => `${h.id || ''}_${h.date || ''}_${h.startTime || ''}`));

    for (const entry of historyRaw) {
      if (!entry || typeof entry !== 'object') continue;
      const entryKey = `${entry.id || ''}_${entry.date || ''}_${entry.startTime || ''}`;

      if (!existingKeys.has(entryKey)) {
        let createdAtVal = entry.createdAt;
        if (!createdAtVal && entry.id) {
          createdAtVal = new Date(entry.id);
        } else if (createdAtVal) {
          createdAtVal = new Date(createdAtVal.seconds ? createdAtVal.seconds * 1000 : createdAtVal);
        }
        if (!createdAtVal || isNaN(createdAtVal.getTime())) {
          createdAtVal = new Date();
        }

        await addHistoryEntry(uid, {
          ...entry,
          createdAt: createdAtVal,
        });
      }
    }
  }
};

// ─── Migrate localStorage data to Firestore (runs once per account) ──────────
export const migrateLocalStorageToFirestore = async (uid) => {
  try {
    const snap = await getDoc(userRef(uid));
    if (snap.exists() && snap.data().migrationDone) return;

    // History
    const localHistory = localStorage.getItem('gym_history') || localStorage.getItem('gym_history_backup');
    if (localHistory) {
      const parsed = JSON.parse(localHistory);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existing = await getHistory(uid);
        if (existing.length === 0) {
          for (const session of parsed) {
            await addHistoryEntry(uid, { ...session, migratedFromLocal: true });
          }
          console.log(`[Migration] Migrated ${parsed.length} history entries.`);
        }
      }
    }

    // Goals
    const localGoals = localStorage.getItem('gym_goals');
    if (localGoals) {
      const existingGoals = await getGoals(uid);
      if (!existingGoals) await updateGoals(uid, JSON.parse(localGoals));
    }

    // Daily Goals
    const localDailyGoals = localStorage.getItem('gym_daily_goals') || localStorage.getItem('gym_target_goals');
    if (localDailyGoals) {
      const existingDailyGoals = await getDailyGoals(uid);
      if (!existingDailyGoals) await updateDailyGoals(uid, JSON.parse(localDailyGoals));
    }

    // Custom Exercises
    const localCustom = localStorage.getItem('gym_custom_exercises');
    if (localCustom) {
      const existingCustom = await getCustomExercises(uid);
      if (Object.keys(existingCustom).length === 0) {
        await updateCustomExercises(uid, JSON.parse(localCustom));
      }
      console.log('[Migration] Migrated custom exercises.');
    }

    await setDoc(userRef(uid), { migrationDone: true }, { merge: true });
    console.log('[Migration] Complete. Flag saved to Firestore.');
  } catch (err) {
    console.error('[Migration] Error:', err);
  }
};
