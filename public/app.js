// Firebase initialization
const auth = firebase.auth();
const db = firebase.firestore();

// HTML elements
const authContainer = document.getElementById("auth-container");
const trackerContainer = document.getElementById("tracker-container");
const feedContainer = document.getElementById("feed-container");
const friendsContainer = document.getElementById("friends-container");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const logoutBtn = document.getElementById("logout-btn");
const usersList = document.getElementById("users-list");

const workoutForm = document.getElementById("workout-form");
const mealForm = document.getElementById("meal-form");
const workoutList = document.getElementById("workout-list");
const mealList = document.getElementById("meal-list");
const feedList = document.getElementById("feed-list");

// Authentication state listener
auth.onAuthStateChanged((user) => {
    if (user) {
        loadProfile(user.uid);
        authContainer.style.display = "none";
        trackerContainer.style.display = "block";
        feedContainer.style.display = "block";
        friendsContainer.style.display = "block";
        loadFeed(user.uid);
        loadUsers();
    } else {
        authContainer.style.display = "block";
        trackerContainer.style.display = "none";
        feedContainer.style.display = "none";
        friendsContainer.style.display = "none";
    }
});

// Sign up
signupBtn.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        alert("Signed up successfully!");
    } catch (error) {
        alert(error.message);
    }
});

// Login
loginBtn.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    try {
        await auth.signInWithEmailAndPassword(email, password);
        alert("Logged in successfully!");
    } catch (error) {
        alert(error.message);
    }
});

// Logout
logoutBtn.addEventListener("click", async () => {
    await auth.signOut();
    alert("Logged out successfully!");
});

// Save Profile
document.getElementById("save-profile-btn").addEventListener("click", async () => {
    const username = document.getElementById("username").value;
    const bio = document.getElementById("bio").value;

    try {
        await db.collection("users").doc(auth.currentUser.uid).set({
            username: username,
            bio: bio
        });
        alert("Profile updated!");
    } catch (error) {
        console.error("Error saving profile:", error);
    }
});

// Load Profile
async function loadProfile(userId) {
    const profileRef = db.collection("users").doc(userId);
    const profileSnap = await profileRef.get();

    if (profileSnap.exists) {
        document.getElementById("username").value = profileSnap.data().username;
        document.getElementById("bio").value = profileSnap.data().bio;
    }
}

// Add Workout
workoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const workoutName = document.getElementById("workout-name").value;
    const workoutDescription = document.getElementById("workout-description").value;

    try {
        await db.collection("workouts").add({
            userId: auth.currentUser.uid,
            name: workoutName,
            description: workoutDescription
        });
        await db.collection("feed").add({
            userId: auth.currentUser.uid,
            type: "workout",
            name: workoutName,
            description: workoutDescription
        });
        workoutForm.reset();
    } catch (error) {
        console.log("Error adding workout:", error);
    }
});

// Add Meal
mealForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const mealName = document.getElementById("meal-name").value;
    const mealDescription = document.getElementById("meal-description").value;

    try {
        await db.collection("meals").add({
            userId: auth.currentUser.uid,
            name: mealName,
            description: mealDescription
        });
        await db.collection("feed").add({
            userId: auth.currentUser.uid,
            type: "meal",
            name: mealName,
            description: mealDescription
        });
        mealForm.reset();
    } catch (error) {
        console.log("Error adding meal:", error);
    }
});

// Load Feed
function loadFeed(userId) {
    const q = db.collection("feed").where("userId", "==", userId);
    q.onSnapshot((querySnapshot) => {
        feedList.innerHTML = "";
        querySnapshot.forEach((doc) => {
            const post = doc.data();
            feedList.innerHTML += `<li>${post.name}: ${post.description}</li>`;
        });
    });
}

// Load Users to Follow
async function loadUsers() {
    const usersSnap = await db.collection("users").get();
    usersList.innerHTML = "";
    usersSnap.forEach((doc) => {
        const user = doc.data();
        usersList.innerHTML += `<li>${user.username} <button onclick="followUser('${doc.id}')">Follow</button></li>`;
    });
}

// Follow User
async function followUser(userId) {
    try {
        await db.collection("follows").add({
            userId: auth.currentUser.uid,
            followUserId: userId
        });
        alert("Followed user!");
    } catch (error) {
        console.log("Error following user:", error);
    }
}
