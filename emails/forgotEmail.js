module.exports = (userId) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Joshua community!</title>
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
            border: 1px solid #DDC8C4;
            background-color: #250902;
            margin: 10px auto;
            border-radius: 20px;
            max-width: 470px;
        }

        .container-blue {
            border: 1px solid #DDC8C4;
            border-radius: 20px;
            background-color: #DDC8C4;
            padding: 20px;
            max-width: 470px;
        }

        .footer {
            border: 1px solid #250902;
            border-radius: 10px;
            background-color: #250902;
            text-align: center;
            height: 25px;
            padding: 5px;
            align-items: center;
            display: flex;
            justify-content: center;
        }

        a {
            border-radius: 10px;
            margin: 10px;
            background-color: transparent;
            border: 2px solid transparent;
            color: #DDC8C4 !important;
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
            background-color: #250902;
            border-radius: 5px;
            width: 150px;
            text-align: center;
            display: flex;
            justify-content: center;
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
            color: #250902;
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
                <h1>¿Has olvidado tu contraseña? 🔐</h1>
                <p>Cámbiala en el siguiente link:</p>
                <br />
                <div class="btn-div">
                    <div class="btn">
                        <a href="http://localhost:5173/setnewpassword/${userId}">Nueva contraseña</a>
                    </div>
                </div>
                <br />
                <p class="note">**Do not response to this email**</p>
                <div class="footer">
                    <a href="https://www.instagram.com/">Website</a>
                </div>
            </div>
        </div>
    </div>
</body>

</html>

`