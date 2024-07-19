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
    const unapprovedAgentsTable = document.getElementById('unapprovedAgentsTable');
    const approvedAgentsTable = document.getElementById('approvedAgentsTable');
    const agentProfileContent = document.getElementById('agentProfileContent');
    const modal = document.getElementById("agentModal");
    const span = document.getElementsByClassName("close")[0];
    const searchInput = document.querySelector('.search-input');
    let allAgents = [];

    // Fetch agents from the backend and populate the tables
    async function fetchAgents() {
        try {
            const response = await fetch('/agents');
            const agents = await response.json();
            allAgents = agents;
            renderAgents(agents);
        } catch (error) {
            console.error('Error fetching agents:', error);
        }
    }

    function renderAgents(agents) {
        unapprovedAgentsTable.innerHTML = '';
        approvedAgentsTable.innerHTML = '';

        agents.forEach(agent => {
            if (agent.status === 'approved') {
                approvedAgentsTable.appendChild(createAgentRow(agent, 'approved'));
            } else {
                unapprovedAgentsTable.appendChild(createAgentRow(agent, 'unapproved'));
            }
        });
    }

    function createAgentRow(agent, status) {
        const tr = document.createElement('tr');
        tr.classList.add('agent-row');
        tr.dataset.agentName = `${agent.agent_firstName || ''} ${agent.agent_lastName || ''}`.toLowerCase();
        tr.id = `${status}AgentRow${agent.agent_id}`;
        tr.innerHTML = `
            <td><a href="#" class="agent-name" data-agent-id="${agent.agent_id}">${agent.agent_firstName || 'N/A'} ${agent.agent_lastName || 'N/A'}</a></td>
            <td>${agent.agent_email || 'N/A'}</td>
            <td>
                <form class="${status === 'approved' ? 'unapprove-form' : 'approve-form'}" data-agent-id="${agent.agent_id}">
                    <button type="submit" class="${status === 'approved' ? 'unapprove-button' : 'approve-button'}">${status === 'approved' ? 'Unapprove' : 'Approve'}</button>
                </form>
            </td>
        `;
        return tr;
    }

    // Handle approval action
    document.addEventListener('submit', async (event) => {
        if (event.target.classList.contains('approve-form') || event.target.classList.contains('unapprove-form')) {
            event.preventDefault();
            const formElement = event.target;
            const agentId = formElement.dataset.agentId;
            const isApproving = formElement.classList.contains('approve-form');

            try {
                const response = await fetch(`/${isApproving ? 'approveAgent' : 'unapproveAgent'}/${agentId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                console.log(data); // Log the response for debugging

                if (response.ok) {
                    // Re-fetch and re-render agents to update the table
                    await fetchAgents();
                } else {
                    console.error('Failed to update agent status:', data.message);
                }
            } catch (error) {
                console.error('Error updating agent status:', error);
            }
        }
    });

    // Function to fetch and display agent profile in a modal
    document.addEventListener('click', async (event) => {
        if (event.target.classList.contains('agent-name')) {
            event.preventDefault();
            const agentId = event.target.dataset.agentId;

            try {
                const response = await fetch(`/getAgent/${agentId}`);
                const agent = await response.json();

                if (response.ok) {
                    agentProfileContent.innerHTML = `
                        <p><strong>Name:</strong> ${agent.agent_firstName || 'N/A'} ${agent.agent_lastName || 'N/A'}</p>
                        <p><strong>Email:</strong> ${agent.agent_email || 'N/A'}</p>
                        <p><strong>Phone Number:</strong> ${agent.agent_phoneNumber || 'N/A'}</p>
                        <p><strong>License No:</strong> ${agent.agent_licenseNo || 'N/A'}</p>
                        <p><strong>Registration No:</strong> ${agent.agent_registrationNo || 'N/A'}</p>
                        <p><strong>Bio:</strong> ${agent.agent_bio || 'N/A'}</p>
                    `;
                    modal.style.display = "block";
                } else {
                    console.error('Failed to fetch agent details:', agent.message);
                }
            } catch (error) {
                console.error('Error fetching agent details:', error);
            }
        }
    });

    // Close the modal when the user clicks on <span> (x)
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Close the modal when the user clicks anywhere outside of the modal
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    function filterAgents() {
        const query = searchInput.value.toLowerCase();
        const filteredAgents = allAgents.filter(agent => 
            (`${agent.agent_firstName || ''} ${agent.agent_lastName || ''}`.toLowerCase().includes(query))
        );
        renderAgents(filteredAgents);
    }

    // Trigger search on input event
    searchInput.addEventListener('input', () => {
        filterAgents();
    });

    // Fetch and render agents on page load
    fetchAgents();
});





