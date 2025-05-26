module.exports = (userId) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset password</title>
    <style>
    body {
        font-family: Arial, sans-serif;
        margin: 0 autop;
        padding: 20px;
        text-align: center;
        width: 100%;
    }

    .container-grey {
        width: 90%;
        border: 1px solid #16375f;
        background-color: #e6eae9;
        margin: 10px auto;
        border-radius: 20px;
        max-width: 470px;
    }

    .container-blue {
        border: 1px solid #16375f;
        border-radius: 20px;
        background-color: #16375f;
        padding: 20px;
        max-width: 470px;
    }

    .footer {
        border: 1px solid #545b66;
        border-radius: 10px;
        background-color: #e6eae9;
        text-align: center;
        height: 25px;
        padding: 5px;
        align-items: center;
    }

    a {
        border-radius: 10px;
        margin: 10px;
        background-color: transparent;
        border: 2px solid transparent;
        color: #545b66 !important;
        cursor: pointer;
        text-decoration: none;
        text-align: center;
    }

    .image {
        height: 250px;
    }

    .header {
        display: flex;
        justify-content: center;
    }

    .header img {
        height: 200px;
        margin: auto
    }

    .btn {
        margin-bottom: 15px;
        padding: 5px;
        font-size: 16px;
        background-color: white;
        border-radius: 5px;
        width: 150px;
        text-align: center;
        height: 25px;
    }

    .container-image {
        text-align: center;
        padding: 15px;
        align-items: center;
    }

    .btn-div {
        margin: 20px;
    }

    .content {
        color: #e6eae9;
    }

    .note {
        font-style: italic;
        text-align: center;
    }
    </style>
</head>

<body>
    <div class="container-grey">
        <div class="container-image">
            <img src="https://res.cloudinary.com/dloxlkff8/image/upload/v1748196454/Daisy_mhsxsf.png" class="image" />
        </div>
        <div class="container-blue">
            <div class="content">
                <h2>Have you forgotten your password? 🔐</h2>
                <p>Change it at the following link:</p>
                <div class="btn-div">
                    <div class="btn">
                        <a href="http://localhost:5173/setnewpassword/${userId}">New Password!</a>
                    </div>
                </div>
                <p class="note">**Do not response to this email**</p>
                <div class="footer">
                    <a href="https://www.instagram.com/">Instagram</a>
                    <a href="https://www.instagram.com/">Website</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>

`