document.getElementById("calculateBtn").addEventListener("click", function() {
  const salary = parseFloat(document.getElementById("salaryInput").value);
  const loan = parseFloat(document.getElementById("loanInput").value);
  const responseBox = document.getElementById("responseText");

  if (isNaN(salary) || isNaN(loan)) {
    responseBox.textContent = "Please enter valid salary and loan amounts!";
    return;
  }

  // Simple financial advice logic
  let loanToIncomeRatio = loan / salary;
  let response;

  if (loanToIncomeRatio > 5) {
    response = `Your loan amount is quite high compared to your salary. Consider reducing expenses and creating a repayment plan.`;
  } else if (loanToIncomeRatio > 2) {
    response = `Your loan amount is manageable, but you may want to increase monthly payments to pay it off faster.`;
  } else {
    response = `You're in a good financial position. Keep saving and ensure you're paying off your loan responsibly.`;
  }

  responseBox.textContent = response;
});
// Function to handle signup
document.getElementById('signupForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (response.ok) {
      alert('Signup successful! You can now login.');
      window.location.href = 'signin.html'; // Redirect to login page
    } else {
      alert('Signup failed. Please try again.');
    }
  } catch (err) {
    console.error('Error during signup:', err);
    alert('An error occurred. Please try again later.');
  }
});

// Function to handle login
document.getElementById('loginForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      alert('Login successful!');
      window.location.href = 'dashboard.html'; // Redirect to dashboard
    } else {
      alert('Invalid username or password.');
    }
  } catch (err) {
    console.error('Error during login:', err);
    alert('An error occurred. Please try again later.');
  }
});

// Function to handle financial advice calculation
document.getElementById("calculateBtn")?.addEventListener("click", function() {
  const salary = parseFloat(document.getElementById("salaryInput").value);
  const loan = parseFloat(document.getElementById("loanInput").value);
  const responseBox = document.getElementById("responseText");

  if (isNaN(salary) || isNaN(loan)) {
    responseBox.textContent = "Please enter valid salary and loan amounts!";
    return;
  }

  // Financial advice logic
  const loanToIncomeRatio = loan / salary;
  let response;

  if (loanToIncomeRatio > 5) {
    response = `Your loan amount is quite high compared to your salary. Consider reducing expenses and creating a repayment plan.`;
  } else if (loanToIncomeRatio > 2) {
    response = `Your loan amount is manageable, but you may want to increase monthly payments to pay it off faster.`;
  } else {
    response = `You're in a good financial position. Keep saving and ensure you're paying off your loan responsibly.`;
  }

  responseBox.textContent = response;
});

// Function to fetch and display user-specific data on the dashboard
document.addEventListener('DOMContentLoaded', async () => {
  if (window.location.pathname === '/dashboard.html') {
    try {
      const response = await fetch('/api/user-info', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Populate user info
        document.querySelector('.user-info').innerHTML = `
          <h2>User Information</h2>
          <p><strong>Username:</strong> ${data.username}</p>
          <p><strong>Email:</strong> ${data.email}</p>
        `;

        // Populate courses
        const coursesList = document.getElementById('coursesList');
        data.courses.forEach(course => {
          const li = document.createElement('li');
          li.textContent = `${course.title} - Progress: ${course.progress}%`;
          coursesList.appendChild(li);
        });

        // Populate progress section
        const progressSection = document.getElementById('progressSection');
        data.courses.forEach(course => {
          const div = document.createElement('div');
          div.innerHTML = `
            <h3>${course.title}</h3>
            <div class="progress-bar" style="width: ${course.progress}%;">${course.progress}%</div>
          `;
          progressSection.appendChild(div);
        });
      } else {
        alert('Failed to load user information.');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  }
});
