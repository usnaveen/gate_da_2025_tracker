// Import the Firebase SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Your Firebase configuration
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

// Listen to auth state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("user-info").innerText = `Hello, ${user.displayName}`;
        document.getElementById("sign-in-button").style.display = "none";
        document.getElementById("sign-out-button").style.display = "block";
        loadCheckboxState(user.uid);
    } else {
        document.getElementById("user-info").innerText = "Please sign in";
        document.getElementById("sign-in-button").style.display = "block";
        document.getElementById("sign-out-button").style.display = "none";
    }
});

// Save checkbox state to Firestore
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

// Load checkbox state from Firestore
async function loadCheckboxState(userId) {
    try {
        const docSnap = await getDoc(doc(db, "progress", userId));
        if (docSnap.exists()) {
            const state = docSnap.data();
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach((checkbox) => {
                checkbox.checked = state[checkbox.id] || false;
            });

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

// Update progress bar based on checkboxes
function updateSubjectProgress(topicElement) {
    const totalCheckboxes = 6;
    const theoryChecked = topicElement.querySelector('input[id*="theory"]').checked;
    const practiceChecked = topicElement.querySelector('input[id*="practice"]').checked;
    const revision1Checked = topicElement.querySelector('input[id*="rev1"]').checked;
    const revision2Checked = topicElement.querySelector('input[id*="rev2"]').checked;
    const pyqChecked = topicElement.querySelector('input[id*="pyq"]').checked;
    const testChecked = topicElement.querySelector('input[id*="test"]').checked;

    const segmentWidth = 100 / totalCheckboxes;

    topicElement.querySelector('.progress-theory').style.width = theoryChecked ? `${segmentWidth}%` : '0';
    topicElement.querySelector('.progress-practice').style.width = practiceChecked ? `${segmentWidth}%` : '0';
    topicElement.querySelector('.progress-revision1').style.width = revision1Checked ? `${segmentWidth}%` : '0';
    topicElement.querySelector('.progress-revision2').style.width = revision2Checked ? `${segmentWidth}%` : '0';
    topicElement.querySelector('.progress-pyq').style.width = pyqChecked ? `${segmentWidth}%` : '0';
    topicElement.querySelector('.progress-test').style.width = testChecked ? `${segmentWidth}%` : '0';
}

// Add event listener to checkboxes
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const topicElement = this.closest('.topic');
        updateSubjectProgress(topicElement);
    });
});

// Calculate overall progress
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

// Sign Out function
function googleSignOut() {
    signOut(auth).then(() => {
        console.log("User signed out.");
        location.reload();
    }).catch((error) => {
        console.error("Error during sign-out: ", error);
    });
}

// Initialize overall progress tracking on page load
window.onload = function() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loadCheckboxState(user.uid);
        }
    });
    calculateOverallProgress();
};
