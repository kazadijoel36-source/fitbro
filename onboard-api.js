async function finishInduction() {
    console.log("Saving User Profile:", userData);
    
    // This connects to your FastAPI /api/user route
    const response = await fetch('/api/user/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });

    if (response.ok) {
        window.location.href = '/dashboard';
    } else {
        alert("System Error: Failed to sync profile.");
    }
}