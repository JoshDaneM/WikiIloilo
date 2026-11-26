// =====================================================
// WikiIloilo - script.js
// All data is saved in the browser (localStorage),
// so no server or database is needed.
// =====================================================


// ---------- 1. SAMPLE DATA (used the first time the site opens) ----------

let defaultPlaces = [
    {
        id: 1,
        name: "Jaro Cathedral",
        category: "Church",
        location: "Jaro, Iloilo City",
        image: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Jaro_Cathedral_%28Catedral_de_Jaro%29.jpg",
        info: "Also known as the Metropolitan Cathedral of St. Elizabeth of Hungary. Its bell tower stands apart from the main building.",
        visits: 98
    },
    {
        id: 2,
        name: "Molo Church",
        category: "Church",
        location: "Molo, Iloilo City",
        image: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Molo_Church%2C_Molo_Plaza_fountain_%28Molo%2C_Iloilo_City%3B_04-03-2024%29.jpg",
        info: "Completed in 1888, Molo Church (St. Anne Parish Church) is a Gothic-Renaissance church known as the \"Feminist Church\" because of its 16 female saint statues.",
        visits: 142
    },
    {
        id: 3,
        name: "Iloilo Esplanade",
        category: "Park",
        location: "Mandurriao, Iloilo City",
        image: "https://cdn.media.amplience.net/i/cebupacificair/ILO.IloiloWeekend-3-IloiloRiverEsplanade?poi=%7B%24this.metadata.pointOfInterest.x%7D%2C%7B%24this.metadata.pointOfInterest.y%7D%2C%7B%24this.metadata.pointOfInterest.w%7D%2C%7B%24this.metadata.pointOfInterest.h%7D&scaleFit=poi&sm=c&w=1980",
        info: "A long riverside promenade popular for walking, jogging and cycling.",
        visits: 75
    },
    {
        id: 4,
        name: "Plaza Libertad",
        category: "Plaza",
        location: "City Proper, Iloilo City",
        image: "",
        info: "A historic public plaza in downtown Iloilo City.",
        visits: 30
    }
];

let defaultUsers = [
    { username: "admin", email: "admin@wikiiloilo.com", password: "admin123", isAdmin: true },
    { username: "juan", email: "juan@email.com", password: "1234", isAdmin: false },
    { username: "maria_iloilo", email: "maria@email.com", password: "1234", isAdmin: false }
];

let defaultComments = [
    { id: 1, placeId: 2, username: "juan", date: "Nov 23, 2026", text: "Visited this afternoon—the red coral stone facade is amazing!" },
    { id: 2, placeId: 2, username: "maria_iloilo", date: "Nov 20, 2026", text: "Don't miss Molo Plaza right across the street!" }
];

let defaultVisited = [
    { username: "juan", placeId: 2 },
    { username: "juan", placeId: 1 }
];


// ---------- 2. HELPER FUNCTIONS ----------

// Read something from the browser storage
function getData(key, defaultValue) {
    let saved = localStorage.getItem(key);
    if (saved === null) {
        return defaultValue;
    }
    return JSON.parse(saved);
}

// Save something to the browser storage
function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getPlaces()   { return getData("places", defaultPlaces); }
function getUsers()    { return getData("users", defaultUsers); }
function getComments() { return getData("comments", defaultComments); }
function getVisited()  { return getData("visited", defaultVisited); }

// Make a new id number (the biggest id + 1)
function nextId(list) {
    let biggest = 0;
    for (let i = 0; i < list.length; i++) {
        if (list[i].id > biggest) {
            biggest = list[i].id;
        }
    }
    return biggest + 1;
}

// Stops typed text from being treated as HTML code
function safe(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function findPlace(id) {
    let places = getPlaces();
    for (let i = 0; i < places.length; i++) {
        if (places[i].id == id) {
            return places[i];
        }
    }
    return null;
}

function findUser(username) {
    let users = getUsers();
    for (let i = 0; i < users.length; i++) {
        if (users[i].username.toLowerCase() == username.toLowerCase()) {
            return users[i];
        }
    }
    return null;
}


// ---------- 3. LOGIN STATE + NAVIGATION BAR ----------

// Returns the logged in username, or null if nobody is logged in
function getCurrentUser() {
    return getData("currentUser", null);
}

function isAdmin() {
    let user = findUser(getCurrentUser() || "");
    return user != null && user.isAdmin == true;
}

// Builds the links at the top of every page
function showNav() {
    let user = getCurrentUser();
    let html = '<a href="index.html">Home</a>';
    html += '<a href="index.html#places">Places</a>';

    if (user == null) {
        html += '<a href="login.html">Login/SignUp</a>';
    } else {
        if (isAdmin()) {
            html += '<a href="admin.html">+ Submit Place</a>';
            html += '<a href="admin.html#comments">Manage Comments</a>';
        }
        html += '<a href="profile.html">My Profile (' + safe(user) + ')</a>';
        html += '<a href="#" onclick="logout()">Logout</a>';
    }

    document.getElementById("nav").innerHTML = html;
}

function logout() {
    saveData("currentUser", null);
    window.location = "index.html";
}


// ---------- 4. MAIN PAGE (index.html) ----------

let currentCategory = "All";

function loadHome() {
    showNav();
    showPlaces();
}

// Draws the place cards that match the search box and the selected category
function showPlaces() {
    let search = document.getElementById("searchInput").value.toLowerCase();
    let places = getPlaces();
    let html = "";

    for (let i = 0; i < places.length; i++) {
        let place = places[i];
        let matchesSearch = place.name.toLowerCase().includes(search);
        let matchesCategory = (currentCategory == "All") || (place.category == currentCategory);

        if (matchesSearch && matchesCategory) {
            html += makeCard(place);
        }
    }

    if (html == "") {
        html = "<p>No places found.</p>";
    }

    document.getElementById("places").innerHTML = html;
}

// Makes the HTML for one place card
function makeCard(place) {
    let picture = '<div class="no-photo">No Photo</div>';
    if (place.image != "") {
        picture = '<img src="' + safe(place.image) + '" alt="' + safe(place.name) + '">';
    }

    return `
        <div class="place-card">
            ${picture}
            <h3>${safe(place.name)}</h3>
            <p>Category: ${safe(place.category)}</p>
            <p>${safe(place.location)}</p>
            <button onclick="viewDetails(${place.id})">View Details</button>
        </div>
    `;
}

// Search for a place (runs when the user clicks Search or types)
function searchPlaces() {
    showPlaces();
}

// Filter places by category
function filterPlaces(category) {
    currentCategory = category;
    showPlaces();
}

// Go to the details page of a place
function viewDetails(placeId) {
    window.location = "details.html?id=" + placeId;
}


// ---------- 5. VISITS ----------

function hasVisited(username, placeId) {
    let visited = getVisited();
    for (let i = 0; i < visited.length; i++) {
        if (visited[i].username == username && visited[i].placeId == placeId) {
            return true;
        }
    }
    return false;
}

function addVisit(username, placeId) {
    let visited = getVisited();
    visited.push({ username: username, placeId: placeId });
    saveData("visited", visited);
    changeVisitCount(placeId, 1);
}

function removeVisit(username, placeId) {
    let visited = getVisited();
    let kept = [];
    for (let i = 0; i < visited.length; i++) {
        if (!(visited[i].username == username && visited[i].placeId == placeId)) {
            kept.push(visited[i]);
        }
    }
    saveData("visited", kept);
    changeVisitCount(placeId, -1);
}

// Adds or subtracts from a place's visit counter
function changeVisitCount(placeId, amount) {
    let places = getPlaces();
    for (let i = 0; i < places.length; i++) {
        if (places[i].id == placeId) {
            places[i].visits = places[i].visits + amount;
        }
    }
    saveData("places", places);
}


// ---------- 6. DETAILS PAGE (details.html) ----------

let currentPlaceId = 0;

function loadDetails() {
    showNav();
    // Read the place id from the web address (details.html?id=2)
    currentPlaceId = Number(new URLSearchParams(window.location.search).get("id"));
    showDetails();
}

function showDetails() {
    let place = findPlace(currentPlaceId);
    let box = document.getElementById("detailsBox");

    if (place == null) {
        box.innerHTML = "<p>Place not found.</p>";
        document.getElementById("commentsBox").innerHTML = "";
        return;
    }

    // Only logged in users can mark a place as visited
    let user = getCurrentUser();
    let visitButton = "";
    if (user != null) {
        if (hasVisited(user, place.id)) {
            visitButton = '<button onclick="toggleVisited()">✓ Visited (click to undo)</button>';
        } else {
            visitButton = '<button onclick="toggleVisited()">Mark as Visited</button>';
        }
    }

    let picture = '<div class="no-photo big-photo">No Photo</div>';
    if (place.image != "") {
        picture = '<img class="big-photo" src="' + safe(place.image) + '" alt="' + safe(place.name) + '">';
    }

    box.innerHTML = `
        <div class="box">
            <h2>${safe(place.name)} ${visitButton}</h2>
            <p>Category: ${safe(place.category)} | Location: ${safe(place.location)} (${place.visits} Visits)</p>
            ${picture}
            <h3>Historical Overview:</h3>
            <p>${safe(place.info)}</p>
        </div>
    `;

    showComments();
}

function toggleVisited() {
    let user = getCurrentUser();
    if (hasVisited(user, currentPlaceId)) {
        removeVisit(user, currentPlaceId);
    } else {
        addVisit(user, currentPlaceId);
    }
    showDetails();
}


// ---------- 7. COMMENTS (create, read, update, delete) ----------

function showComments() {
    let user = getCurrentUser();
    let comments = getComments();
    let list = "";
    let count = 0;

    for (let i = 0; i < comments.length; i++) {
        let c = comments[i];
        if (c.placeId != currentPlaceId) {
            continue;
        }
        count++;

        // Buttons: owner can edit + delete, admin can delete
        let buttons = "";
        if (user == c.username) {
            buttons = `<button onclick="editComment(${c.id})">Edit</button>
                       <button class="danger" onclick="deleteComment(${c.id})">Delete</button>`;
        } else if (isAdmin()) {
            buttons = `<button class="danger" onclick="deleteComment(${c.id})">Delete</button>`;
        }

        list += `
            <div class="comment">
                <strong>${safe(c.username)}</strong> (${safe(c.date)}) ${buttons}
                <p>"${safe(c.text)}"</p>
            </div>
        `;
    }

    // Show the comment form only if logged in
    let form = "";
    if (user == null) {
        form = '<p><a href="login.html">Log in or Register</a> to post a comment or mark this visited!</p>';
    } else {
        form = `
            <textarea id="commentText" rows="3" placeholder="Share your experience or travel tip..."></textarea>
            <button onclick="postComment()">Post Comment</button>
        `;
    }

    document.getElementById("commentsBox").innerHTML =
        "<h2>VISITOR COMMENTS & TIPS (" + count + ")</h2>" + form + list;
}

// CREATE
function postComment() {
    let text = document.getElementById("commentText").value.trim();
    if (text == "") {
        alert("Please write something first.");
        return;
    }

    let comments = getComments();
    comments.push({
        id: nextId(comments),
        placeId: currentPlaceId,
        username: getCurrentUser(),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        text: text
    });
    saveData("comments", comments);
    showComments();
}

// UPDATE
function editComment(commentId) {
    let comments = getComments();
    for (let i = 0; i < comments.length; i++) {
        if (comments[i].id == commentId) {
            let newText = prompt("Edit your comment:", comments[i].text);
            if (newText != null && newText.trim() != "") {
                comments[i].text = newText.trim();
            }
        }
    }
    saveData("comments", comments);
    showComments();
}

// DELETE (used on the details page and the admin page)
function deleteComment(commentId) {
    if (!confirm("Delete this comment?")) {
        return;
    }

    let comments = getComments();
    let kept = [];
    for (let i = 0; i < comments.length; i++) {
        if (comments[i].id != commentId) {
            kept.push(comments[i]);
        }
    }
    saveData("comments", kept);

    // Refresh whichever page we are on
    if (document.getElementById("commentsBox")) {
        showComments();
    }
    if (document.getElementById("adminComments")) {
        showAdminComments();
    }
}


// ---------- 8. LOGIN + REGISTER (login.html) ----------

function login() {
    let username = document.getElementById("loginUsername").value.trim();
    let password = document.getElementById("loginPassword").value;
    let message = document.getElementById("loginMessage");

    let user = findUser(username);
    if (user == null || user.password != password) {
        message.innerText = "Wrong username or password.";
        return;
    }

    saveData("currentUser", user.username);

    if (user.isAdmin) {
        window.location = "admin.html";
    } else {
        window.location = "index.html";
    }
}

function register() {
    let username = document.getElementById("regUsername").value.trim();
    let email = document.getElementById("regEmail").value.trim();
    let password = document.getElementById("regPassword").value;
    let message = document.getElementById("registerMessage");

    if (username == "" || email == "" || password == "") {
        message.innerText = "Please fill in all the boxes.";
        return;
    }
    if (findUser(username) != null) {
        message.innerText = "That username is already taken.";
        return;
    }

    let users = getUsers();
    users.push({ username: username, email: email, password: password, isAdmin: false });
    saveData("users", users);

    // Log the new user in right away
    saveData("currentUser", username);
    window.location = "index.html";
}


// ---------- 9. ADMIN DASHBOARD (admin.html) ----------

let editingId = null;   // null = adding a new place, a number = editing that place

function loadAdmin() {
    showNav();

    if (!isAdmin()) {
        document.getElementById("adminPage").innerHTML =
            '<div class="box"><h2>Admins only</h2><p>Please <a href="login.html">log in</a> as the admin to see this page.</p></div>';
        return;
    }

    showAdminPlaces();
    showAdminComments();
}

// CREATE + UPDATE
function savePlace() {
    let name = document.getElementById("placeName").value.trim();
    let category = document.getElementById("placeCategory").value;
    let district = document.getElementById("placeLocation").value.trim();
    let image = document.getElementById("placeImage").value.trim();
    let info = document.getElementById("placeInfo").value.trim();

    if (name == "" || district == "") {
        alert("Please enter a place name and a location.");
        return;
    }

    let places = getPlaces();

    if (editingId == null) {
        // Add a new place
        places.push({
            id: nextId(places),
            name: name,
            category: category,
            location: district,
            image: image,
            info: info,
            visits: 0
        });
    } else {
        // Update the place we are editing
        for (let i = 0; i < places.length; i++) {
            if (places[i].id == editingId) {
                places[i].name = name;
                places[i].category = category;
                places[i].location = district;
                places[i].image = image;
                places[i].info = info;
            }
        }
    }

    saveData("places", places);
    clearForm();
    showAdminPlaces();
}

// Put a place's details into the form so it can be changed
function editPlace(id) {
    let place = findPlace(id);
    editingId = id;

    document.getElementById("placeName").value = place.name;
    document.getElementById("placeCategory").value = place.category;
    document.getElementById("placeLocation").value = place.location;
    document.getElementById("placeImage").value = place.image;
    document.getElementById("placeInfo").value = place.info;

    document.getElementById("formTitle").innerText = "1. Edit Place";
    document.getElementById("saveButton").innerText = "Save Changes";
    window.scrollTo(0, 0);
}

function clearForm() {
    editingId = null;
    document.getElementById("placeName").value = "";
    document.getElementById("placeCategory").value = "Church";
    document.getElementById("placeLocation").value = "";
    document.getElementById("placeImage").value = "";
    document.getElementById("placeInfo").value = "";
    document.getElementById("formTitle").innerText = "1. Add a New Official Place";
    document.getElementById("saveButton").innerText = "+ Publish Place";
}

// DELETE
function deletePlace(id) {
    if (!confirm("Delete this place and its comments?")) {
        return;
    }

    // Remove the place
    let places = getPlaces();
    let keptPlaces = [];
    for (let i = 0; i < places.length; i++) {
        if (places[i].id != id) {
            keptPlaces.push(places[i]);
        }
    }
    saveData("places", keptPlaces);

    // Remove its comments
    let comments = getComments();
    let keptComments = [];
    for (let i = 0; i < comments.length; i++) {
        if (comments[i].placeId != id) {
            keptComments.push(comments[i]);
        }
    }
    saveData("comments", keptComments);

    // Remove its visit records
    let visited = getVisited();
    let keptVisited = [];
    for (let i = 0; i < visited.length; i++) {
        if (visited[i].placeId != id) {
            keptVisited.push(visited[i]);
        }
    }
    saveData("visited", keptVisited);

    showAdminPlaces();
    showAdminComments();
}

// READ - table of all places
function showAdminPlaces() {
    let places = getPlaces();
    let html = "<table><tr><th>ID</th><th>Place Name</th><th>Category</th><th>Actions</th></tr>";

    for (let i = 0; i < places.length; i++) {
        let p = places[i];
        html += `
            <tr>
                <td>${p.id}</td>
                <td>${safe(p.name)}</td>
                <td>${safe(p.category)}</td>
                <td>
                    <button onclick="editPlace(${p.id})">Edit</button>
                    <button class="danger" onclick="deletePlace(${p.id})">Delete</button>
                </td>
            </tr>
        `;
    }

    html += "</table>";
    document.getElementById("adminPlaces").innerHTML = html;
}

// READ - table of all comments (so the admin can remove bad ones)
function showAdminComments() {
    let comments = getComments();
    let html = "<table><tr><th>Place</th><th>User</th><th>Comment</th><th>Action</th></tr>";

    for (let i = 0; i < comments.length; i++) {
        let c = comments[i];
        let place = findPlace(c.placeId);
        let placeName = "(deleted place)";
        if (place != null) {
            placeName = place.name;
        }

        html += `
            <tr>
                <td>${safe(placeName)}</td>
                <td>${safe(c.username)}</td>
                <td>${safe(c.text)}</td>
                <td><button class="danger" onclick="deleteComment(${c.id})">Delete</button></td>
            </tr>
        `;
    }

    if (comments.length == 0) {
        html += '<tr><td colspan="4">No comments yet.</td></tr>';
    }

    html += "</table>";
    document.getElementById("adminComments").innerHTML = html;
}


// ---------- 10. USER PROFILE (profile.html) ----------

function loadProfile() {
    // Must be logged in to see this page
    if (getCurrentUser() == null) {
        window.location = "login.html";
        return;
    }

    showNav();

    let user = findUser(getCurrentUser());
    document.getElementById("profUsername").value = user.username;
    document.getElementById("profEmail").value = user.email;

    showVisitedList();
}

// UPDATE
function updateProfile() {
    let oldName = getCurrentUser();
    let newName = document.getElementById("profUsername").value.trim();
    let newEmail = document.getElementById("profEmail").value.trim();
    let newPassword = document.getElementById("profPassword").value;
    let message = document.getElementById("profileMessage");

    if (newName == "" || newEmail == "") {
        message.innerText = "Username and email cannot be empty.";
        return;
    }

    // Make sure the new username is not used by someone else
    let other = findUser(newName);
    if (other != null && other.username != oldName) {
        message.innerText = "That username is already taken.";
        return;
    }

    // Update the user
    let users = getUsers();
    for (let i = 0; i < users.length; i++) {
        if (users[i].username == oldName) {
            users[i].username = newName;
            users[i].email = newEmail;
            if (newPassword != "") {
                users[i].password = newPassword;
            }
        }
    }
    saveData("users", users);

    // Keep the user's comments and visits linked to the new name
    let comments = getComments();
    for (let i = 0; i < comments.length; i++) {
        if (comments[i].username == oldName) {
            comments[i].username = newName;
        }
    }
    saveData("comments", comments);

    let visited = getVisited();
    for (let i = 0; i < visited.length; i++) {
        if (visited[i].username == oldName) {
            visited[i].username = newName;
        }
    }
    saveData("visited", visited);

    saveData("currentUser", newName);
    document.getElementById("profPassword").value = "";
    message.innerText = "Profile updated!";
    showNav();
}

// DELETE
function deleteAccount() {
    if (isAdmin()) {
        alert("The admin account cannot be deleted.");
        return;
    }
    if (!confirm("Delete your account? This cannot be undone.")) {
        return;
    }

    let username = getCurrentUser();

    // Remove this user's visits (this also lowers the visit counters)
    let visited = getVisited();
    for (let i = 0; i < visited.length; i++) {
        if (visited[i].username == username) {
            removeVisit(username, visited[i].placeId);
        }
    }

    // Remove this user's comments
    let comments = getComments();
    let keptComments = [];
    for (let i = 0; i < comments.length; i++) {
        if (comments[i].username != username) {
            keptComments.push(comments[i]);
        }
    }
    saveData("comments", keptComments);

    // Remove the user
    let users = getUsers();
    let keptUsers = [];
    for (let i = 0; i < users.length; i++) {
        if (users[i].username != username) {
            keptUsers.push(users[i]);
        }
    }
    saveData("users", keptUsers);

    logout();
}

// READ - places this user has visited
function showVisitedList() {
    let username = getCurrentUser();
    let visited = getVisited();
    let html = "<table><tr><th>#</th><th>Place Name</th><th>District</th><th>Action</th></tr>";
    let count = 0;

    for (let i = 0; i < visited.length; i++) {
        if (visited[i].username != username) {
            continue;
        }
        let place = findPlace(visited[i].placeId);
        if (place == null) {
            continue;
        }
        count++;

        html += `
            <tr>
                <td>${count}</td>
                <td>${safe(place.name)}</td>
                <td>${safe(place.location)}</td>
                <td>
                    <button onclick="viewDetails(${place.id})">View</button>
                    <button class="danger" onclick="removeFromProfile(${place.id})">Remove</button>
                </td>
            </tr>
        `;
    }

    if (count == 0) {
        html += '<tr><td colspan="4">You have not visited any places yet.</td></tr>';
    }

    html += "</table>";
    document.getElementById("visitedTitle").innerText = "PLACES I HAVE VISITED IN ILOILO (" + count + ")";
    document.getElementById("visitedList").innerHTML = html;
}

function removeFromProfile(placeId) {
    removeVisit(getCurrentUser(), placeId);
    showVisitedList();
}
