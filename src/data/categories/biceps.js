export const bicepsExercises = [
  {
    id: "standing-dumbbell-bicep-curl",
    name: "Standing Dumbbell Bicep Curl (Supinated)",
    muscle: "biceps",
    muscleTarget: "Long Head + Short Head (Overall mass)",
    difficulty: "beginner",
    levels: {
      beginner: { sets: 3, reps: "12-15", focus: "Form & Supination" },
      intermediate: { sets: 4, reps: "10-12", focus: "Hypertrophy" },
      advanced: { sets: 5, reps: "8-10", focus: "Peak Contraction" }
    },
    tutorialUrl: "https://www.youtube.com/results?search_query=how+to+dumbbell+bicep+curl",
    instructions: [
      "Dumbbells ko neutral grip me pakdo.",
      "Arms completely straight, shoulders relaxed.",
      "Curl start karte waqt wrist ko gradually supinate karo (andar ki taraf ghumaao).",
      "Elbows body ke side chipke rakho — hilne nahi dene.",
      "Top position pe 1–2 sec hard squeeze.",
      "Down phase ko 3 second slow control ke saath le jao."
    ],
    tips: [
      "Supination = biceps peak.",
      "Weight halka rakho → form 100% perfect banegi.",
      "Mind-muscle → biceps ko imagine karo contracting.",
      "Tempo: 1 sec up → 2 sec squeeze → 3 sec down"
    ],
    image: "/assets/exercises/biceps_image.png"
  },
  {
    id: "barbell-bicep-curl",
    name: "Barbell Bicep Curl",
    muscle: "biceps",
    muscleTarget: "Short Head + Mass (Width builder)",
    difficulty: "beginner",
    levels: {
      beginner: { sets: 3, reps: "12-15", focus: "Overall Strength" },
      intermediate: { sets: 4, reps: "8-12", focus: "Mass Construction" },
      advanced: { sets: 5, reps: "6-10", focus: "Heavy Load Adaptation" }
    },
    tutorialUrl: "https://www.youtube.com/results?search_query=how+to+barbell+bicep+curl",
    instructions: [
      "Shoulder-width stance lo.",
      "Barbell ko shoulder-width ya wide grip me pakdo.",
      "Chest up, core tight.",
      "Curl bar ko straight arc me upar lekar jao.",
      "Top pe elbow lock mat karo — slight bend.",
      "Down phase slow & controlled."
    ],
    tips: [
      "Wide grip = wider biceps.",
      "Heavy use kar sakte ho, par control ke saath.",
      "Keep head neutral (upar mat dekho).",
      "Tempo: 1.5 sec up → 1 sec hold → 3 sec down"
    ],
    image: "/assets/exercises/biceps_image_1.png"
  },
  {
    id: "ez-bar-wide-curl",
    name: "EZ-Bar Curl (Wide Grip)",
    muscle: "biceps",
    muscleTarget: "Short Head -> Biceps Width",
    difficulty: "beginner",
    levels: {
      beginner: { sets: 3, reps: "12-15", focus: "Wrist Comfort" },
      intermediate: { sets: 4, reps: "10-12", focus: "Width Development" },
      advanced: { sets: 5, reps: "8-10", focus: "Inner Peak Squeeze" }
    },
    tutorialUrl: "https://www.youtube.com/results?search_query=how+to+ez+bar+curl+wide+grip",
    instructions: [
      "EZ bar ko outward grip se pakdo.",
      "Elbows tight and tucked.",
      "Curl bar ko chest ke upar tak lao.",
      "Top pe tight squeeze.",
      "Full stretch at bottom."
    ],
    tips: [
      "Wide grip -> perfect for wide biceps.",
      "Keep wrists comfortable (EZ bar ergonomic hota hai).",
      "Short head grow = width increase.",
      "Tempo: 1–2 sec up → 2 sec squeeze → 3 sec down"
    ],
    image: "/assets/exercises/biceps_image_2.png"
  },
  {
    id: "incline-dumbbell-curl",
    name: "Incline Dumbbell Curls",
    muscle: "biceps",
    muscleTarget: "Long Head (Peak Builder)",
    difficulty: "intermediate",
    levels: {
      beginner: { sets: 2, reps: "12-15", focus: "Deep Stretch" },
      intermediate: { sets: 3, reps: "10-12", focus: "Long Head Growth" },
      advanced: { sets: 4, reps: "8-10", focus: "Maximum Peak Tension" }
    },
    tutorialUrl: "https://www.youtube.com/results?search_query=how+to+incline+dumbbell+curl",
    instructions: [
      "Bench angle 40–45° pe set karo.",
      "Arms ko bilkul niche drop hone do.",
      "Start curl with full stretch (deepest stretch exercise).",
      "Top pe squeeze but elbows forward mat le jaana.",
      "Down phase slow & controlled."
    ],
    tips: [
      "Deep stretch = long head explode growth.",
      "Yeh peak banane wali #1 exercise hai.",
      "Full ROM mandatory.",
      "Tempo: 2 sec up → 1–2 sec hold → 4 sec down (slow stretch)"
    ],
    image: "/assets/exercises/biceps_image_4.png"
  },
  {
    id: "hammer-curl-dumbbell",
    name: "Hammer Curl (Dumbbell)",
    muscle: "biceps",
    muscleTarget: "Brachialis + Biceps Thickness",
    difficulty: "beginner",
    levels: {
      beginner: { sets: 3, reps: "12-15", focus: "Grip Strength" },
      intermediate: { sets: 4, reps: "10-12", focus: "Forearm Mass" },
      advanced: { sets: 5, reps: "8-10", focus: "Arm Thickness" }
    },
    tutorialUrl: "https://www.youtube.com/results?search_query=how+to+hammer+curl",
    instructions: [
      "Dumbbells neutral grip me pakdo.",
      "Elbows ko tight rakho.",
      "Dumbbell ko straight upward arc me curl karo.",
      "Top pe slight squeeze.",
      "Down slow."
    ],
    tips: [
      "Arm thickness banane ki #1 exercise.",
      "Brachialis = biceps ko upar push karta hai.",
      "Makes arms look BIGGER.",
      "Tempo: 1 sec up → 1 sec squeeze → 3 sec down"
    ],
    image: "/assets/exercises/biceps_image_11.png"
  },
  {
    id: "preacher-curl-machine",
    name: "Preacher Curl (Machine)",
    muscle: "biceps",
    muscleTarget: "Short Head (Width + Shape)",
    difficulty: "beginner",
    levels: {
      beginner: { sets: 3, reps: "15", focus: "Isolation" },
      intermediate: { sets: 4, reps: "12", focus: "Strict Form" },
      advanced: { sets: 5, reps: "10 (With Pauses)", focus: "Peak Burn" }
    },
    tutorialUrl: "https://www.youtube.com/results?search_query=how+to+machine+preacher+curl",
    instructions: [
      "Machine seat adjust karo so elbow pad perfect height par ho.",
      "Arms fixed on pad.",
      "Curl upwards slowly.",
      "Top pe soft squeeze.",
      "Downwards full stretch till you feel burn."
    ],
    tips: [
      "Machine = strict form, no cheating.",
      "Short head grow = wide biceps look.",
      "Perfect exercise for beginners.",
      "Tempo: 2 sec up → 1 sec hold → 3 sec down"
    ],
    image: "/assets/exercises/biceps_image_6.png"
  }
];
