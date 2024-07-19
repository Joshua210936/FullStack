function openFeedback(evt, feedbackType) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
  }

  // Get all elements with class="nav-link" and remove the class "active"
  tablinks = document.getElementsByClassName("nav-link");
  for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(feedbackType).style.display = "block";
  evt.currentTarget.className += " active";
}

// Simulate a click on the first tab link to display the "All Feedback" tab by default
document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('.nav-link.active').click();
});
