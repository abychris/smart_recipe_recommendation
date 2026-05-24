# Project Handover Guide (BCA Final Year Project)

To run this project on your friend's laptop, follow these simple steps. You don't need to worry about Antigravity or complex tools.

## 1. Prerequisites
Ask your friend to install these two things:
1. **Laragon**: [Download here](https://laragon.org/download/). (Download the **Full** version).
2. **Python**: [Download here](https://www.python.org/downloads/). (Check the box that says **"Add Python to PATH"** during installation).

## 2. Setting Up the Folder
1. Copy the entire `smart_recipe` folder to your friend's computer.
2. It's best to put it in `C:\laragon\www\smart_recipe`.

## 3. Setting Up the Database
1. Open **Laragon** and click **Start All**.
2. Click the **Database** button in Laragon (or open HeidiSQL).
3. Right-click on the left sidebar and choose **Create new > Database**. Name it `smart_recipe_db`.
4. Click on `smart_recipe_db`, go to **File > Load SQL file...**.
5. Select the file: `database/full_dump.sql` inside the project folder.
6. Click the **Run** button (blue play icon) to import all tables and recipes.

## 4. Installing Dependencies
Open a command prompt in the project folder and run:
```bash
pip install -r requirements.txt
```

## 5. Running the Project
I have created a `run_app.bat` file in the folder. 
**Your friend just needs to double-click `run_app.bat` to start the website.**

Once it starts, they can open their browser and go to:
`http://127.0.0.1:5000`

---

## Important Files for Submission:
- **`app.py`**: The main logic (Backend).
- **`templates/`**: All the UI pages (Frontend).
- **`static/`**: CSS and JavaScript.
- **`database/full_dump.sql`**: The entire database backup.
- **`requirements.txt`**: List of required Python libraries.
