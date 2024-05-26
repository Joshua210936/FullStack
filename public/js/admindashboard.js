document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');

    const propertiesContent = `
    <div class="container">
        <h1 class="text-center">Dashboard</h1>
        <div class="row">
            <div class="dashboardbox d-flex dashboard-bg1">
                <div class="align-content-center mr-3 ml-1"><img src="images/propertyicon.png" alt="Property Icon" class="icons"></div>
                <div>
                    <h4>Total Properties</h4>
                    <h5>15</h5>
                </div>
            </div>
            <div class="dashboardbox d-flex dashboard-bg2">
                <div class="align-content-center mr-3 ml-1"><img src="images/new.png" alt="New Property Icon" class="icons"></div>
                <div>
                    <h4>New Properties</h4>
                    <h5>3</h5>
                </div>
            </div>
            <div class="dashboardbox d-flex dashboard-bg3">
                <div class="align-content-center mr-3 ml-1"><img src="images/rent.png" alt="Rent Property Icon" class="icons"></div>
                <div>
                    <h4>Properties Rented</h4>
                    <h5>3</h5>
                </div>
            </div>
            <div class="dashboardbox d-flex dashboard-bg4">
                <div class="align-content-center mr-3 ml-1"><img src="images/sold.png" alt="Sold Property Icon" class="icons"></div>
                <div>
                    <h4>Properties Sold</h4>
                    <h5>5</h5>
                </div>
            </div>
        </div>
        <div class="row2">
            <div><img src="images/chart.png" alt="chart"></div>
            <div><img src="images/chart.png" alt="chart"></div>
        </div>
    </div>
`;

    const agentsContent = `
    <div class="container">
        <h1 class="text-center">Dashboard</h1>
        <div class="row">
            <div class="dashboardbox d-flex dashboard-bg1">
                <div class="align-content-center mr-3 ml-1"><img src="images/propertyicon.png" alt="Property Icon" class="icons"></div>
                <div>
                    <h4>Total Agents</h4>
                    <h5>15</h5>
                </div>
            </div>
            <div class="dashboardbox d-flex dashboard-bg2">
                <div class="align-content-center mr-3 ml-1"><img src="images/new.png" alt="New Property Icon" class="icons"></div>
                <div>
                    <h4>New Agents</h4>
                    <h5>3</h5>
                </div>
            </div>
            <div class="dashboardbox d-flex dashboard-bg3">
                <div class="align-content-center mr-3 ml-1"><img src="images/rent.png" alt="Rent Property Icon" class="icons"></div>
                <div>
                    <h4>Active Agents</h4>
                    <h5>3</h5>
                </div>
            </div>
            <div class="dashboardbox d-flex justify-content-center align-items-center dashboard-bg4">
            <div>
                <h4 class="text-center">Top-performing Agent</h4>
                <img src="images/agent1.jpg" alt="topagent" class="icons topagent">
            </div>
        </div>
        
        </div>
        <div class="row2">
            <div><img src="images/chart.png" alt="chart"></div>
            <div><img src="images/chart.png" alt="chart"></div>
        </div>
    </div>
`;

    document.getElementById('properties-link').addEventListener('click', (event) => {
        event.preventDefault();
        mainContent.innerHTML = propertiesContent;
    });

    document.getElementById('agent-link').addEventListener('click', (event) => {
        event.preventDefault();
        mainContent.innerHTML = agentsContent;
    });

    // Load default content
    mainContent.innerHTML = dashboardContent;
});
