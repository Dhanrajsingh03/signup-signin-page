// Import and configure Firebase
// Add your Firebase configuration here
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyBA5nwuQfAHwqHmY67ozbPOBPm8xUZI_Hs",
    authDomain: "project-thesensors.firebaseapp.com",
    projectId: "project-thesensors",
    storageBucket: "project-thesensors.firebasestorage.app",
    messagingSenderId: "1020454592769",
    appId: "1:1020454592769:web:502aa21ad544e445483b00",
    measurementId: "G-KWZF8JLER2",
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// DOM Elements
const projectForm = document.getElementById('project-form');
const projectsList = document.getElementById('projects-list');

// Upload project function
projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('project-title').value;
    const description = document.getElementById('project-description').value;
    const imageFile = document.getElementById('project-image').files[0];
    const pdfFile = document.getElementById('project-pdf').files[0];

    try {
        // Upload image to Firebase Storage
        const imageRef = ref(storage, `projects/images/${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        const imageUrl = await getDownloadURL(imageRef);

        // Upload PDF to Firebase Storage
        const pdfRef = ref(storage, `projects/pdfs/${pdfFile.name}`);
        await uploadBytes(pdfRef, pdfFile);
        const pdfUrl = await getDownloadURL(pdfRef);

        // Save project details to Firestore
        await addDoc(collection(db, 'projects'), {
            title,
            description,
            imageUrl,
            pdfUrl,
            createdAt: new Date().toISOString()
        });

        // Add project to "All Projects" section
        addProjectToUI({ title, description, imageUrl, pdfUrl });

        // Reset the form
        projectForm.reset();
        alert('Project uploaded successfully!');
    } catch (error) {
        console.error('Error uploading project:', error);
        alert('Failed to upload the project. Please try again.');
    }
});

// Function to add a project to the "All Projects" section
function addProjectToUI(project) {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';

    projectCard.innerHTML = `
        <img src="${project.imageUrl}" alt="Project Image">
        <div class="content">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <a href="${project.pdfUrl}" target="_blank">View Project PDF</a>
        </div>
    `;

    projectsList.appendChild(projectCard);
}

// Fetch and display all projects on page load
async function fetchProjects() {
    try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        querySnapshot.forEach((doc) => {
            const project = doc.data();
            addProjectToUI(project);
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
}

// Call fetchProjects on page load
fetchProjects();
