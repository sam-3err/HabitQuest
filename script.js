// ============================
// HabitQuest - Full JS Code
// ============================

// ----------------------------
// Clear old localStorage if you want a fresh start
// Uncomment below line to reset everything once
// localStorage.clear();
// ----------------------------

// Load stats from localStorage or initialize
let points = parseInt(localStorage.getItem("points")) || 0;
let coins = parseInt(localStorage.getItem("coins")) || 0;
let level = parseInt(localStorage.getItem("level")) || 1;

// Habits list starts empty
let habits = JSON.parse(localStorage.getItem("habits")) || [];
if (!localStorage.getItem("habits")) habits = [];

// Achievements / badges
let badges = JSON.parse(localStorage.getItem("badges")) || [];

// Difficulty points
const difficultyPoints = { Easy: 10, Medium: 20, Hard: 30 };

// ----------------------------
// DOM Elements
// ----------------------------
const habitList = document.getElementById("habitList");
const pointsEl = document.getElementById("points");
const coinsEl = document.getElementById("coins");
const levelEl = document.getElementById("level");
const avatarEl = document.getElementById("avatar");
const questProgress = document.getElementById("questProgress");
const badgeList = document.getElementById("badgeList");
const openChestBtn = document.getElementById("openChest");

// Modal Elements
const addHabitBtn = document.getElementById("addHabitBtn");
const habitModal = document.getElementById("habitModal");
const closeModal = document.querySelector(".close");
const saveHabit = document.getElementById("saveHabit");
const habitNameInput = document.getElementById("habitName");
const habitDifficulty = document.getElementById("habitDifficulty");

// ============================
// Render Habits
// ============================
function renderHabits() {
    habitList.innerHTML = "";
    if (habits.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No habits added yet. Click 'Add New Habit' to start!";
        li.style.fontStyle = "italic";
        li.style.opacity = "0.7";
        habitList.appendChild(li);
        return;
    }

    habits.forEach((habit, index) => {
        const li = document.createElement("li");
        li.className = habit.completed ? "completed" : "";
        li.innerHTML = `
            <span>${habit.name} (${habit.difficulty}) - Streak: ${habit.streak}</span>
            <button onclick="toggleHabit(${index})">${habit.completed ? "Undo" : "Done"}</button>
        `;
        habitList.appendChild(li);
    });

    updateProgress();
    renderBadges();
}

// ============================
// Toggle Habit Completion
// ============================
function toggleHabit(index) {
    let habit = habits[index];
    habit.completed = !habit.completed;

    if (habit.completed) {
        habit.streak += 1;
        let earned = calculatePoints(habit.difficulty, habit.streak);
        points += earned;
        coins += Math.floor(earned / 10);
        confettiEffect();
        checkLevelUp();
        checkAchievements();
    } else {
        habit.streak = Math.max(0, habit.streak - 1);
    }

    saveData();
    updateStats();
    renderHabits();
}

// ============================
// Calculate Points
// ============================
function calculatePoints(difficulty, streak) {
    let base = difficultyPoints[difficulty];
    let streakMultiplier = 1 + streak * 0.05;
    let dailyBonus = allHabitsCompletedToday() ? 1.2 : 1; // 20% bonus if all habits done
    return Math.round(base * streakMultiplier * dailyBonus);
}

function allHabitsCompletedToday() {
    return habits.length > 0 && habits.every(h => h.completed);
}

// ============================
// Update Stats
// ============================
function updateStats() {
    pointsEl.textContent = points;
    coinsEl.textContent = coins;
    levelEl.textContent = level;
}

// ============================
// Level Up
// ============================
function checkLevelUp() {
    let nextLevelPoints = level * 100;
    if (points >= nextLevelPoints) {
        level += 1;
        alert(`🎉 Level Up! You reached Level ${level}!`);
    }
}

// ============================
// Progress Bar & Avatar
// ============================
function updateProgress() {
    if (habits.length === 0) {
        questProgress.style.width = "0%";
        avatarEl.style.left = "0%";
        return;
    }

    let completedCount = habits.filter(h => h.completed).length;
    let progressPercent = (completedCount / habits.length) * 100;
    questProgress.style.width = progressPercent + "%";
    avatarEl.style.left = `calc(${progressPercent}% - 20px)`; // center avatar
}

// ============================
// Confetti Animation
// ============================
function confettiEffect() {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    document.body.appendChild(confetti);
    confetti.style.position = "fixed";
    confetti.style.left = Math.random() * window.innerWidth + "px";
    confetti.style.top = "-20px";
    confetti.style.width = "10px";
    confetti.style.height = "10px";
    confetti.style.backgroundColor = `hsl(${Math.random()*360},70%,50%)`;
    confetti.style.borderRadius = "50%";
    confetti.style.zIndex = 9999;
    confetti.style.animation = "fall 1s linear forwards";

    setTimeout(() => confetti.remove(), 1000);
}

// ============================
// Achievements / Badges
// ============================
function checkAchievements() {
    let newBadge = null;

    if (!badges.includes("7-Day Streak") && habits.some(h => h.streak >= 7)) {
        badges.push("7-Day Streak");
        newBadge = "7-Day Streak";
    }
    if (!badges.includes("First Hard Habit") && habits.some(h => h.difficulty === "Hard" && h.completed)) {
        badges.push("First Hard Habit");
        newBadge = "First Hard Habit";
    }

    if (newBadge) {
        alert(`🏆 Achievement Unlocked: ${newBadge}!`);
    }

    saveData();
    renderBadges();
}

function renderBadges() {
    badgeList.innerHTML = "";

    // Example badge visuals
    const badgeVisuals = {
        "7-Day Streak": {emoji: "🔥", color: "gold"},
        "First Hard Habit": {emoji: "💪", color: "silver"},
        "All Habits Completed": {emoji: "🏆", color: "orange"},
        "Level 5 Achieved": {emoji: "⭐", color: "lightblue"}
    };

    // Iterate badges
    badges.forEach(b => {
        const div = document.createElement("div");
        div.className = "badge";
        const visual = badgeVisuals[b] || {emoji: "🎖️", color: "white"};
        div.textContent = visual.emoji;
        div.style.backgroundColor = visual.color;
        div.setAttribute("data-title", b); // Tooltip text
        badgeList.appendChild(div);

        // Unlock animation
        div.style.transform = "scale(0)";
        setTimeout(() => {
            div.style.transition = "transform 0.5s ease";
            div.style.transform = "scale(1)";
        }, 50);
    });
}

// ============================
// Loot Chest
// ============================
openChestBtn.onclick = () => {
    if (coins < 5) {
        alert("You need at least 5 coins to open the chest!");
        return;
    }
    coins -= 5;
    let reward = Math.floor(Math.random() * 20) + 10; // random reward
    coins += reward;
    alert(`🎁 Loot Chest Opened! You got ${reward} coins!`);
    saveData();
    updateStats();
}

// ============================
// Add Habit Modal
// ============================
addHabitBtn.onclick = () => { habitModal.style.display = "block"; }
closeModal.onclick = () => { habitModal.style.display = "none"; }

saveHabit.onclick = () => {
    let name = habitNameInput.value.trim();
    let diff = habitDifficulty.value;
    if (name) {
        habits.push({name, difficulty: diff, streak: 0, completed: false});
        habitNameInput.value = "";
        habitModal.style.display = "none";
        saveData();
        renderHabits();
    }
}

// ============================
// Save Data to localStorage
// ============================
function saveData() {
    localStorage.setItem("habits", JSON.stringify(habits));
    localStorage.setItem("points", points);
    localStorage.setItem("coins", coins);
    localStorage.setItem("level", level);
    localStorage.setItem("badges", JSON.stringify(badges));
}

// ============================
// Close modal if clicked outside
// ============================
window.onclick = function(event) {
    if (event.target == habitModal) habitModal.style.display = "none";
}

// ============================
// Initial Render
// ============================
renderHabits();
updateStats();
