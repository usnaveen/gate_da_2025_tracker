// Import the Firebase SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAowbD3T4k0PKfM3TqzZG-GYuSU-WLv18s",
  authDomain: "gatedatracker.firebaseapp.com",
  projectId: "gatedatracker",
  storageBucket: "gatedatracker.appspot.com",
  messagingSenderId: "219844748899",
  appId: "1:219844748899:web:338d84350d9951b8ff7a56",
  measurementId: "G-GK2VRXJTQG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Function to save checkbox state to Firestore
async function saveCheckboxState(userId) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const state = {};

    checkboxes.forEach((checkbox) => {
        state[checkbox.id] = checkbox.checked;
    });

    try {
        await setDoc(doc(db, "progress", userId), state);
        console.log("Progress successfully saved to Firestore!");
    } catch (error) {
        console.error("Error saving progress: ", error);
    }
}

// Function to load checkbox state from Firestore
async function loadCheckboxState(userId) {
    try {
        const docSnap = await getDoc(doc(db, "progress", userId));
        if (docSnap.exists()) {
            const state = docSnap.data();
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach((checkbox) => {
                checkbox.checked = state[checkbox.id] || false;
            });

            // Update the subject and overall progress
            document.querySelectorAll('.topic').forEach(topic => {
                updateSubjectProgress(topic);
            });
            calculateOverallProgress();
        } else {
            console.log("No saved progress found.");
        }
    } catch (error) {
        console.error("Error loading progress: ", error);
    }
}

// Function to update the subject-specific progress bars
function updateSubjectProgress(topicElement) {
    const checkboxes = topicElement.querySelectorAll('input[type="checkbox"]');
    const progressBar = topicElement.querySelector('.progress-bar div');
    const total = checkboxes.length;
    const checked = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
    const progressPercentage = (checked / total) * 100;
    progressBar.style.width = progressPercentage + '%';
}

// Function to calculate and display the overall progress
function calculateOverallProgress() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const totalCheckboxes = checkboxes.length;
    const checkedCheckboxes = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
    const overallProgressPercentage = (checkedCheckboxes / totalCheckboxes) * 100;

    const progressBar = document.getElementById('overall-progress-bar');
    progressBar.style.width = overallProgressPercentage + '%';

    const progressPercentageText = document.getElementById('overall-progress-percentage');
    progressPercentageText.innerText = Math.round(overallProgressPercentage) + '%';
}

// Attach event listeners to the checkboxes
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        const topicElement = this.closest('.topic');
        updateSubjectProgress(topicElement);
        calculateOverallProgress();

        onAuthStateChanged(auth, (user) => {
            if (user) {
                saveCheckboxState(user.uid);
            }
        });
    });
});

// Google Sign-In function
function googleSignIn() {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            console.log("User signed in: ", user.displayName);
            loadCheckboxState(user.uid);
        })
        .catch((error) => {
            console.error("Error during sign-in: ", error);
        });
}

// Google Sign-Out function
function googleSignOut() {
    signOut(auth).then(() => {
        console.log("User signed out.");
        location.reload();
    }).catch((error) => {
        console.error("Error during sign-out: ", error);
    });
}

// Initialize the app on page load
window.onload = function () {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loadCheckboxState(user.uid);
        }
    });
    calculateOverallProgress();
};
