export const chestExercises = [
  {
    id: "barbell-bench-press-flat",
    name: "Barbell Bench Press (Flat)",
    muscle: "chest",
    muscleTarget: "Middle Chest",
    difficulty: "intermediate",
    levels: {
      beginner: { sets: 3, reps: "12-15", focus: "Form & Control" },
      intermediate: { sets: 4, reps: "8-12", focus: "Hypertrophy" },
      advanced: { sets: 5, reps: "6-10", focus: "Strength & Plateau Breaking" }
    },
    tutorialUrl: "https://www.youtube.com/results?search_query=how+to+barbell+bench+press",
    instructions: [
      "Lie flat on a bench, feet on floor.",
      "Grip the bar slightly wider than shoulder-width.",
      "Lower the bar slowly to your mid-chest.",
      "Push it back up till your arms are fully extended."
    ],
    tips: [
      "Keep your chest up and shoulder blades squeezed.",
      "Don’t bounce the bar off your chest.",
      "Control the movement (2 seconds down, 1 second up)."
    ],
    image: "/assets/exercises/chest_image.png"
  },
  {
    id: "dumbbell-bench-press",
    name: "Dumbbell Bench Press",
    muscle: "chest",
    muscleTarget: "Middle Chest (better stretch than barbell)",
    difficulty: "intermediate",
    levels: {
      beginner: { sets: 3, reps: "12-15", focus: "Stabilization" },
      intermediate: { sets: 4, reps: "10-12", focus: "Muscle Fiber Recruitment" },
      advanced: { sets: 5, reps: "8-10", focus: "Deep Tissue Activation" }
    },
    tutorialUrl: "https://www.youtube.com/results?search_query=how+to+dumbbell+bench+press",
    instructions: [
      "Sit and bring dumbbells to your thighs.",
      "Lie back and press them up together over your chest.",
      "Lower slowly till arms are parallel to the floor, then push up."
    ],
    tips: [
      "Keep wrists straight, don’t let them bend backward.",
      "Move in a controlled path — dumbbells allow a deeper stretch."
    ],
    image: "/assets/exercises/chest_image_1.png"
  },
  {
    id: "incline-barbell-bench-press",
    name: "Incline Barbell Bench Press",
    muscle: "chest",
    muscleTarget: "Upper Chest",
    difficulty: "intermediate",
    levels: {
      beginner: { sets: 3, reps: "12-15", focus: "Upper Pec Activation" },
      intermediate: { sets: 4, reps: "8-12", focus: "Upper Chest Volume" },
      advanced: { sets: 5, reps: "6-8", focus: "Explosive Power" }
    },
    tutorialUrl: "https://www.youtube.com/results?search_query=how+to+incline+barbell+press",
    instructions: [
      "Set bench at 30–45° incline.",
      "Grip slightly wider than shoulder-width.",
      "Lower bar to upper chest (near collarbone), then press up."
    ],
    tips: [
      "Don’t go too high incline — 30° is ideal.",
      "Focus on squeezing your upper chest at top."
    ],
    image: "/assets/exercises/chest_image_2.png"
  },
  {
    id: "incline-dumbbell-press",
    name: "Incline Dumbbell Press",
    muscle: "chest",
    muscleTarget: "Upper Chest",
    difficulty: "intermediate",
    levels: {
      beginner: { sets: 3, reps: "12-15", focus: "Range of Motion" },
      intermediate: { sets: 4, reps: "10-12", focus: "Inner Upper Pec Squeeze" },
      advanced: { sets: 5, reps: "8-10", focus: "Maximum Intensity" }
    },
    tutorialUrl: "https://www.youtube.com/results?search_query=how+to+incline+dumbbell+press",
    instructions: [
      "Same as incline barbell, but with dumbbells for better range.",
      "Lower dumbbells in a controlled arc, push them back up together."
    ],
    tips: [
      "Don’t lock elbows completely.",
      "Imagine “bringing the dumbbells together” by chest squeeze."
    ],
    image: "/assets/exercises/chest_image_3.png"
  },
  {
    id: "decline-barbell-bench-press",
    name: "Decline Barbell Bench Press",
    muscle: "chest",
    muscleTarget: "Lower Chest",
    difficulty: "intermediate",
    levels: {
      beginner: { sets: 2, reps: "12-15", focus: "Stability" },
      intermediate: { sets: 3, reps: "10-12", focus: "Lower Chest Shaping" },
      advanced: { sets: 4, reps: "8-10", focus: "Heavy Load Capacity" }
    },
    tutorialUrl: "https://www.youtube.com/results?search_query=how+to+decline+barbell+press",
    instructions: [
      "Lie on decline bench, grip bar slightly wide.",
      "Lower to lower chest area, then push up till arms extended."
    ],
    tips: [
      "Keep head neutral.",
      "Perfect for rounding lower pecs and thickness."
    ],
    image: "/assets/exercises/chest_image_4.png"
  },
  {
    id: "chest-dips",
    name: "Chest Dips (Bodyweight or Weighted)",
    muscle: "chest",
    muscleTarget: "Lower Chest + Outer Chest",
    difficulty: "intermediate",
    levels: {
      beginner: { sets: 3, reps: "Failure", focus: "Bodyweight Control" },
      intermediate: { sets: 4, reps: "12-15", focus: "Endurance & Depth" },
      advanced: { sets: 5, reps: "8-12 (Weighted)", focus: "Maximum Strength" }
    },
    tutorialUrl: "https://www.youtube.com/results?search_query=how+to+chest+dips",
    instructions: [
      "Grip parallel bars, lean slightly forward, elbows flared slightly.",
      "Lower your body till chest stretch, push back up."
    ],
    tips: [
      "Lean forward, don’t stay upright (upright = triceps focus).",
      "Go slow — don’t bounce."
    ],
    image: "/assets/exercises/chest_image_6.png"
  },
  {
    id: "push-ups-classic",
    name: "Push-Ups (Classic)",
    muscle: "chest",
    muscleTarget: "Full Chest",
    difficulty: "beginner",
    levels: {
      beginner: { sets: 3, reps: "10-15", focus: "Proper Form" },
      intermediate: { sets: 4, reps: "20-30", focus: "Muscular Endurance" },
      advanced: { sets: 5, reps: "40-50", focus: "High Volume" }
    },
    tutorialUrl: "https://www.youtube.com/results?search_query=how+to+perfect+pushups",
    instructions: [
      "Hands shoulder-width, lower chest till it’s near the floor.",
      "Push up with control."
    ],
    tips: [
      "Keep core tight, body straight.",
      "Go full range of motion."
    ],
    image: "/assets/exercises/chest_image_7.png"
  },
  {
    id: "cable-crossover-high-to-low",
    name: "Cable Crossover (High to Low)",
    muscle: "chest",
    muscleTarget: "Lower & Inner Chest",
    difficulty: "intermediate",
    levels: {
      beginner: { sets: 3, reps: "15", focus: "Squeeze & Feel" },
      intermediate: { sets: 4, reps: "12-15", focus: "Detail & Definition" },
      advanced: { sets: 5, reps: "10-12 (Slow)", focus: "Mind-Muscle Connection" }
    },
    tutorialUrl: "https://www.youtube.com/results?search_query=how+to+cable+crossover+high+to+low",
    instructions: [
      "Set pulleys high, take handles, step forward slightly.",
      "Bring hands downward in front of hips in a hugging motion."
    ],
    tips: [
      "Slight bend in elbows.",
      "Focus on chest squeeze, not arms."
    ],
    image: "/assets/exercises/chest_image_10.png"
  },
  {
    id: "pec-deck-fly",
    name: "Pec Deck / Machine Fly",
    muscle: "chest",
    muscleTarget: "Inner & Middle Chest",
    difficulty: "beginner",
    levels: {
      beginner: { sets: 3, reps: "15", focus: "Isolation" },
      intermediate: { sets: 4, reps: "12", focus: "Constant Tension" },
      advanced: { sets: 5, reps: "10 (With Drop Sets)", focus: "Massive Burn" }
    },
    tutorialUrl: "https://www.youtube.com/results?search_query=how+to+pec+deck+machine+fly",
    instructions: [
      "Sit on machine, arms bent slightly.",
      "Bring handles together, squeeze chest hard for 1–2 seconds."
    ],
    tips: [
      "Don’t slam weights.",
      "Keep shoulders down and chest up."
    ],
    image: "/assets/exercises/chest_image_12.png"
  }
];
