function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("show");
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).classList.add("show");
    evt.currentTarget.classList.add("active");
}



document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('feedbackcontainer');

    const allFeedbackContent = ` 
    <h1 class="text-center">All Feedback</h1>
    <div class="search">
        <span class="search-icon material-symbols-outlined">search</span>
        <input class="search-input" type="search" placeholder="Filter feedback">
        <button class="filter-icon"><span class="material-symbols-outlined">tune</span> </button> 
    </div>
    <p class="text-center">Average feedback: 4 stars</p>
    <p class="text-center">3 unreviewed feedback</p>
    <div class="tab">
        <button class="tablinks" onclick="openTab(event, 'Completed')">Completed</button>
        <button class="tablinks" onclick="openTab(event, 'Pending')">Pending</button>
    </div>

    <div id="Completed" class="tabcontent">
        <table>
            <thead>
                <tr>
                    <th>Ticket ID</th>
                    <th>Type</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Rating</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>Issue</td>
                    <td>John</td>
                    <td>user1@example.com</td>
                    <td>4/5</td>
                    <td>02/05/2024</td>
                    <td>I cant list a property</td>
                    <td>Completed</td>
                    <td><button class="btn btn-info">View</button></td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>Issue</td>
                    <td>Sabrina</td>
                    <td>user2@example.com</td>
                    <td>4/5</td>
                    <td>02/05/2024</td>
                    <td>I cant list a property</td>
                    <td>Completed</td>
                    <td><button class="btn btn-info">View</button></td>
                </tr>
                <tr>
                    <td>3</td>
                    <td>Issue</td>
                    <td>Joanne</td>
                    <td>user3@example.com</td>
                    <td>4/5</td>
                    <td>02/05/2024</td>
                    <td>I cant list a property</td>
                    <td>Completed</td>
                    <td><button class="btn btn-info">View</button></td>  
                </tr>
                <tr>
                    <td>7</td>
                    <td>Suggestion</td>
                    <td>Joanne</td>
                    <td>user3@example.com</td>
                    <td>4/5</td>
                    <td>03/05/2025</td>
                    <td>Really liked this website</td>
                    <td>NIL</td>
                    <td>NIL</td>
                </tr>
                <tr>
                    <td>8</td>
                    <td>Suggestion</td>
                    <td>Sabrina</td>
                    <td>user2@example.com</td>
                    <td>4/5</td>
                    <td>03/05/2025</td>
                    <td>UI not color blind friendly</td>
                    <td>NIL</td>
                    <td>NIL</td>
                </tr>
                <tr>
                    <td>9</td>
                    <td>Suggestion</td>
                    <td>John</td>
                    <td>user1@example.com</td>
                    <td>4/5</td>
                    <td>03/05/2025</td>
                    <td>Words too small</td>
                    <td>NIL</td>
                    <td>NIL</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div id="Pending" class="tabcontent">
        <table>
            <thead>
                <tr>
                    <th>Ticket ID</th>
                    <th>Type</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Rating</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>4</td>
                    <td>Issue</td>
                    <td>Lucas</td>
                    <td>user4@example.com</td>
                    <td>4/5</td>
                    <td>02/05/2024</td>
                    <td>I got scammed by agent 1</td>
                    <td>Pending</td>
                    <td><button class="btn btn-success">Complete</button></td>
                </tr>
                <tr>
                    <td>5</td>
                    <td>Issue</td>
                    <td>Sean</td>
                    <td>user5@example.com</td>
                    <td>4/5</td>
                    <td>02/05/2024</td>
                    <td>I got scammed by agent 1</td>
                    <td>Pending</td>
                    <td><button class="btn btn-success">Complete</button></td>
                </tr>
                <tr>
                    <td>6</td>
                    <td>Issue</td>
                    <td>Steve</td>
                    <td>user6@example.com</td>
                    <td>4/5</td>
                    <td>02/05/2024</td>
                    <td>Payment didnt go through</td>
                    <td>Pending</td>
                    <td><button class="btn btn-success">Complete</button></td>
                </tr>
            </tbody>
        </table>
    </div>
`;

    const issuesContent = ` 
    <h1 class="text-center">All Issues</h1>
    <div class="search">
        <span class="search-icon material-symbols-outlined">search</span>
        <input class="search-input" type="search" placeholder="Filter feedback">
        <button class="filter-icon"><span class="material-symbols-outlined">tune</span> </button> 
    </div>
    <p class="text-center">Average feedback: 4 stars</p>
    <p class="text-center">3 unreviewed feedback</p>
    <div class="tab">
        <button class="tablinks" onclick="openTab(event, 'Completed')">Completed</button>
        <button class="tablinks" onclick="openTab(event, 'Pending')">Pending</button>
    </div>

    <div id="Completed" class="tabcontent">
        <table>
            <thead>
                <tr>
                    <th>Ticket ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Rating</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>John</td>
                    <td>user1@example.com</td>
                    <td>4/5</td>
                    <td>02/05/2024</td>
                    <td>I cant list a property</td>
                    <td>Completed</td>
                    <td><button class="btn btn-info">View</button></td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>Sabrina</td>
                    <td>user2@example.com</td>
                    <td>4/5</td>
                    <td>02/05/2024</td>
                    <td>I cant list a property</td>
                    <td>Completed</td>
                    <td><button class="btn btn-info">View</button></td>
                </tr>
                <tr>
                    <td>3</td>
                    <td>Joanne</td>
                    <td>user3@example.com</td>
                    <td>4/5</td>
                    <td>02/05/2024</td>
                    <td>I cant list a property</td>
                    <td>Completed</td>
                    <td><button class="btn btn-info">View</button></td>  
                </tr>
            </tbody>
        </table>
    </div>

    <div id="Pending" class="tabcontent">
        <table>
            <thead>
                <tr>
                    <th>Ticket ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Rating</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>4</td>
                    <td>Lucas</td>
                    <td>user4@example.com</td>
                    <td>4/5</td>
                    <td>02/05/2024</td>
                    <td>I got scammed by agent 1</td>
                    <td>Pending</td>
                    <td><button class="btn btn-success">Complete</button></td>
                </tr>
                <tr>
                    <td>5</td>
                    <td>Sean</td>
                    <td>user5@example.com</td>
                    <td>4/5</td>
                    <td>02/05/2024</td>
                    <td>I got scammed by agent 1</td>
                    <td>Pending</td>
                    <td><button class="btn btn-success">Complete</button></td>
                </tr>
                <tr>
                    <td>6</td>
                    <td>Steve</td>
                    <td>user6@example.com</td>
                    <td>4/5</td>
                    <td>02/05/2024</td>
                    <td>Payment didnt go through</td>
                    <td>Pending</td>
                    <td><button class="btn btn-success">Complete</button></td>
                </tr>
            </tbody>
        </table>
    </div>
`;

    const feedbacksContent =  ` 
    <h1 class="text-center">Suggestions</h1>
   
    <div class="tab">
        <button class="tablinks" onclick="openTab(event, 'Date')">Date</button>
        <button class="tablinks" onclick="openTab(event, 'Ratings')">Ratings</button>
    </div>

    <div id="Date" class="tabcontent">
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Rating</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
            <tr>
                <td>Joanne</td>
                <td>user3@example.com</td>
                <td>4/5</td>
                <td>03/05/2025</td>
                <td>Really liked this website</td>
                <td>NIL</td>
                <td>NIL</td>
            </tr>
                <tr>
                    <td>Sabrina</td>
                    <td>user2@example.com</td>
                    <td>4/5</td>
                    <td>03/05/2025</td>
                    <td>UI not color blind friendly</td>
                    <td>NIL</td>
                    <td>NIL</td>
                </tr>
                <tr>
                    <td>John</td>
                    <td>user1@example.com</td>
                    <td>4/5</td>
                    <td>03/05/2025</td>
                    <td>Words too small</td>
                    <td>NIL</td>
                    <td>NIL</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div id="Ratings" class="tabcontent">
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Rating</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
        <tbody>
            <tr>
                <td>Joanne</td>
                <td>user3@example.com</td>
                <td>4/5</td>
                <td>03/05/2025</td>
                <td>Really liked this website</td>
                <td>NIL</td>
                <td>NIL</td>
            </tr>
                <tr>
                    <td>Sabrina</td>
                    <td>user2@example.com</td>
                    <td>4/5</td>
                    <td>03/05/2025</td>
                    <td>UI not color blind friendly</td>
                    <td>NIL</td>
                    <td>NIL</td>
                </tr>
                <tr>
                    <td>John</td>
                    <td>user1@example.com</td>
                    <td>4/5</td>
                    <td>03/05/2025</td>
                    <td>Words too small</td>
                    <td>NIL</td>
                    <td>NIL</td>
                </tr>
            </tbody>
        </table>
    </div>
`;
const othersContent =  ` 
<h1 class="text-center">Others</h1>
`;

    document.getElementById('all-link').addEventListener('click', (event) => {
        event.preventDefault();
        mainContent.innerHTML = allFeedbackContent;
    });

    document.getElementById('issues-link').addEventListener('click', (event) => {
        event.preventDefault();
        mainContent.innerHTML = issuesContent;
    });

    document.getElementById('feedbacks-link').addEventListener('click', (event) => {
        event.preventDefault();
        mainContent.innerHTML = feedbacksContent;
        
    });
    document.getElementById('others-link').addEventListener('click', (event) => {
        event.preventDefault();
        mainContent.innerHTML = othersContent;
    });

    // Load default content
    mainContent.innerHTML = allFeedbackContent;
});
