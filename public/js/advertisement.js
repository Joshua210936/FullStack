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
    const mainContent = document.getElementById('bannercontainer');

    const bannersContent = ` 
    <h1 class="text-center">Manage Banners(<a href="/addAdvertisement">add new</a>)</h1>
    <div>

        <div class="d-flex">
            <button class="btn btn-outline-danger">Delete banners</button>
            <div class="d-flex sort">
                <p class="mr-0 ml-0 mt-auto mb-auto">Sort by</p>
                <select id="filter">
                    <option value="all">All</option>
                    <option value="option1">Start Date</option>
                    <option value="option2">End Date</option>
                    <option value="option3">Group</option>
                </select>

                <button class="btn btn-outline-primary">Sort</button>
            </div>

        </div>

        <div class="mt-5">
            <div class="tab">
                <button class="tablinks" onclick="openTab(event, 'active')">Active</button>
                <button class="tablinks" onclick="openTab(event, 'nonactive')">Inactive</button>
            </div>
            <div id="active" class="tabcontent">
                <table class="bannertable">
                    <thead>
                        <tr>
                            <th></th>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Image</th>
                            <th>Show from</th>
                            <th>Show until</th>
                            <th>Group</th>
                            <th colspan="2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><input type="checkbox"></td>
                            <td>2</td>
                            <td>Popular Properties</td>
                            <td><img src="images/propertybanner.jpg" alt="Banners" class="bannerimg"></td>
                            <td>27 April 2024</td>
                            <td>28 May 2024</td>
                            <td>Uncategorized</td>
                            <td><button class="btn btn-info">Edit</button></td>
                            <td><button class="btn btn-danger">Delete</button></td>
                        </tr>
                        <tr>
                            <td><input type="checkbox"></td>
                            <td>3</td>
                            <td>Upcoming properties</td>
                            <td><img src="images/propertybanner.jpg" alt="Banners" class="bannerimg"></td>
                            <td>20 April 2024</td>
                            <td>20 June 2024</td>
                            <td>Sidebar Tower</td>
                            <td><button class="btn btn-info">Edit</button></td>
                            <td><button class="btn btn-danger">Delete</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div id="nonactive" class="tabcontent">
                <table class="bannertable">
                    <thead>
                        <tr>
                            <th></th>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Image</th>
                            <th>Show from</th>
                            <th>Show until</th>
                            <th>Group</th>
                            <th colspan="2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><input type="checkbox"></td>
                            <td>1</td>
                            <td>New Properties</td>
                            <td><img src="images/propertybanner.jpg" alt="Banners" class="bannerimg"></td>
                            <td>27 April 2024</td>
                            <td>14 May 2024</td>
                            <td>Uncategorized</td>
                            <td><button class="btn btn-info">Edit</button></td>
                            <td><button class="btn btn-danger">Delete</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
`;

    const bannergroupsContent =  ` 
    <h1 class="text-center">Manage Banner Categories(<a href="/addNewBannerCategory">add new category</a>)</h1>
    <div>

        <div class="d-flex">
            <button class="btn btn-outline-danger">Delete banner groups</button>
            <div class="d-flex sort">
                <p class="mr-0 ml-0 mt-auto mb-auto">Sort by</p>
                <select id="filter">
                    <option value="all">All</option>
                    <option value="option1">Total banners</option>
                    <option value="option2">Active banners</option>
                </select>

                <button class="btn btn-outline-primary">Sort</button>
            </div>

        </div>
    <table class="bannertable">
                    <thead>
                        <tr>
                            <th></th>
                            <th>ID</th>
                            <th>Category Name</th>
                            <th>Total banners</th>
                            <th>Active banners</th>
                            <th colspan="2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><input type="checkbox"></td>
                            <td>1</td>
                            <td>Sidebar Tower</td>
                            <td>5</td>
                            <td>2</td>
                            <td><button class="btn btn-info">Edit</button></td>
                            <td><button class="btn btn-danger">Delete</button></td>
                        </tr>
                        <tr>
                        <td><input type="checkbox"></td>
                        <td>2</td>
                        <td>Post headings</td>
                        <td>3</td>
                        <td>1</td>
                        <td><button class="btn btn-info">Edit</button></td>
                        <td><button class="btn btn-danger">Delete</button></td>
                    </tr>
                    </tbody>
                </table>
`;

    document.getElementById('banners-link').addEventListener('click', (event) => {
        event.preventDefault();
        mainContent.innerHTML = bannersContent;
    });

    document.getElementById('bannergroups-link').addEventListener('click', (event) => {
        event.preventDefault();
        mainContent.innerHTML = bannergroupsContent;
        
    });

    // Load default content
    mainContent.innerHTML = bannersContent;
});
