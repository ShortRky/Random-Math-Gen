let score = 0;
let rankIndex = 0;
let selectedTopic = "";
let currentQuestion = {};
let rankThresholds = [15, 30, 50, 80, 120];  // Harder rank-up scaling

const ranks = ["E", "D", "C", "B", "A", "S", "SS", "SSS", "G.O.D"];
const mathTopics = ["Functions", "Advanced Functions", "Algebra", "Trigonometry", "Calculus", "Probability"];

// 📌 Topic Descriptions
const topicOverviews = {
    "Functions": "Functions describe relationships between inputs and outputs.",
    "Advanced Functions": "Advanced functions include transformations and inverses.",
    "Algebra": "Algebra involves equations, variables, and unknowns.",
    "Trigonometry": "Trigonometry focuses on angles, sine, cosine, and real-world applications.",
    "Calculus": "Calculus is about derivatives, integrals, and rate of change.",
    "Probability": "Probability is the study of likelihood and uncertainty."
};

// 📌 Topic Selection
function selectTopic(topic) {
    selectedTopic = topic;
    showSection("overview-section");
    document.getElementById("overview-title").innerText = topic;
    document.getElementById("overview-text").innerText = topicOverviews[topic];
}

// 📌 Start Game
function startGame() {
    showSection("game-section");
    score = 0;
    rankIndex = 0;
    updateRank();
    generateQuestion();
    generateChallenges();
}

// 🎯 **Randomized Math Question Generator**
function generateQuestion() {
    let questionText = "";
    let correctAnswer;

    switch (selectedTopic) {
        case "Functions":
            let a = randomNumber(1, 10);
            let b = randomNumber(1, 20);
            let x = randomNumber(1, 15);
            questionText = `If f(x) = ${a}x² + ${b}, what is f(${x})?`;
            correctAnswer = a * x * x + b;
            break;

        case "Advanced Functions":
            let c = randomNumber(1, 10);
            let d = randomNumber(1, 10);
            let e = randomNumber(1, 10);
            questionText = `If g(x) = ${c}x² + ${d}x + ${e}, find g(3).`;
            correctAnswer = c * 9 + d * 3 + e;
            break;

        case "Algebra":
            let v1 = randomNumber(1, 10);
            let v2 = randomNumber(1, 20);
            let v3 = randomNumber(1, 15);
            let solution = (v3 - v2) / v1;
            questionText = `Solve for x: ${v1}x + ${v2} = ${v3}`;
            correctAnswer = solution.toFixed(2);
            break;

        case "Trigonometry":
            let angle = [30, 45, 60, 90][randomNumber(0, 3)];
            let trigFunction = ["sin", "cos", "tan"][randomNumber(0, 2)];
            questionText = `What is ${trigFunction}(${angle})?`;
            correctAnswer = getTrigValue(trigFunction, angle);
            break;

        case "Calculus":
            let coef = randomNumber(1, 5);
            let power = randomNumber(2, 4);
            questionText = `Find the derivative of f(x) = ${coef}x^${power}.`;
            correctAnswer = `${coef * power}x^${power - 1}`;
            break;

        case "Probability":
            let total = randomNumber(5, 15);
            let chosen = randomNumber(1, total);
            questionText = `A bag has ${total} marbles. ${chosen} are red. What's the probability of drawing a red marble?`;
            correctAnswer = (chosen / total).toFixed(2);
            break;
    }

    currentQuestion = { text: questionText, answer: correctAnswer };
    document.getElementById("question").innerText = questionText;
}

// ✅ **Answer Checking**
function submitAnswer() {
    let userAnswer = document.getElementById("answer").value.trim();
    let feedback = document.getElementById("feedback");

    if (userAnswer == currentQuestion.answer) {
        score += 5;
        feedback.innerHTML = "✅ Correct! Well done!";
        feedback.style.color = "#00ff00";
    } else {
        feedback.innerHTML = `❌ Wrong! Correct answer: ${currentQuestion.answer}.`;
        feedback.style.color = "#ff4444";
    }

    updateRank();
    generateQuestion();
}

// 🔥 **Harder Rank-Up System**
function updateRank() {
    if (score >= rankThresholds[rankIndex]) {
        score = 0;
        rankIndex = Math.min(rankIndex + 1, ranks.length - 1);
    }

    document.getElementById("score").innerText = `Score: ${score}`;
    document.getElementById("rank").innerText = `Rank: ${ranks[rankIndex]}`;
}

// 🏅 **Generate Challenges**
function generateChallenges() {
    const challenges = [
        "Solve 3 problems correctly in a row!",
        "Reach Rank C!",
        "Score 100 points!",
        "Answer a probability question correctly!"
    ];
    let list = document.getElementById("challenge-list");
    list.innerHTML = "";
    challenges.forEach(challenge => {
        let li = document.createElement("li");
        li.innerText = challenge;
        list.appendChild(li);
    });
}

// 🎭 **Smooth Section Transition**
function showSection(sectionId) {
    document.querySelectorAll(".container").forEach(sec => sec.style.display = "none");
    document.getElementById(sectionId).style.display = "block";
}

// 🎲 **Random Number Generator**
function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 🔢 **Get Trigonometric Values**
function getTrigValue(func, angle) {
    const trigValues = {
        "sin": { 30: "0.5", 45: "0.707", 60: "0.866", 90: "1" },
        "cos": { 30: "0.866", 45: "0.707", 60: "0.5", 90: "0" },
        "tan": { 30: "0.577", 45: "1", 60: "1.732", 90: "undefined" }
    };
    return trigValues[func][angle];
}

// Load the user data from the data.json file
async function loadUserData() {
    const response = await fetch('data.json');
    const data = await response.json();
    return data;
}

// Function to update the user's score and rank
async function updateUserData(userId, score, answerCorrect) {
    const data = await loadUserData();

    // Find the user
    const user = data.users.find(u => u.id === userId);
    if (!user) return;

    // Update score
    user.score += score;

    // Check for correct answer and update rank
    if (answerCorrect) {
        user.totalPoints += score; // Increment total points on correct answer
        if (user.score >= 100) {
            user.rank = "A"; // Example rank-up logic
        } else if (user.score >= 50) {
            user.rank = "B";
        } else if (user.score >= 20) {
            user.rank = "C";
        }
    }

    // Log completed challenge (example)
    if (user.score >= 50) {
        user.completedChallenges.push("Reach Rank B!");
    }

    // Update the user's data in data.json (or send back to a server)
    await saveUserData(data);
}

// Save the updated user data back to data.json (this example assumes a server-side approach)
async function saveUserData(data) {
    // Normally, you'd send the data to the server to persist the changes
    console.log("User Data Updated:", data);
    // Simulating saving data back to the server or file system
}


// 🚀 **Init Game**
window.onload = function() {
    showSection("topic-selection");
};
