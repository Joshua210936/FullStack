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

   // JavaScript to handle approval action
   document.addEventListener('DOMContentLoaded', () => {
    const approveForms = document.querySelectorAll('.approve-form');
    approveForms.forEach(form => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formElement = event.target;
            const agentId = formElement.dataset.agentId;

            try {
                const response = await fetch(`/approveAgent/${agentId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                const data = await response.json();
                console.log(data); // Log the response for debugging

                // Move the approved agent row to the approved section
                const agentRow = document.getElementById(`agentRow${agentId}`);
                const approvedAgentsTable = document.querySelector('#approved table tbody');
                if (agentRow && approvedAgentsTable) {
                    agentRow.remove(); // Remove from unapproved section
                    
                    // Create a new row for the approved section
                    const approvedAgentRow = document.createElement('tr');
                    approvedAgentRow.id = `approvedAgentRow${data.agent.agent_id}`;
                    approvedAgentRow.innerHTML = `
                        <td>${data.agent.agent_firstName} ${data.agent.agent_lastName}</td>
                        <td>${data.agent.agent_email}</td>
                        <td>
                            <form class="unapprove-form" action="/unapproveAgent/${data.agent.agent_id}" method="POST" data-agent-id="${data.agent.agent_id}">
                                <button type="submit" class="unapprove-button">Unapprove</button>
                            </form>
                        </td>
                    `;
                    approvedAgentsTable.appendChild(approvedAgentRow); // Append to approved section
                }

            } catch (error) {
                console.error('Error approving agent:', error);
                // Handle error (e.g., display error message to user)
            }
        });
    });
});



