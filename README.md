# CM2603 - Data Science - Group Project

## Group Members
| Person No. | IIT ID   | RGU ID  | Student Name                    |
| ---------- | -------- | ------- | ------------------------------- |
| 1          | 20221812| 2331419 | Moderage Ethan Christoff PereraWickramage       |
| 2          | 20230903 | 2330903 | Himansa Wathsiluni Jayasuriya   |
| 3          | 20220950 | 2330973 | Senuli Laknara |
| 4          | 20232429 | 2330893 | Mevinu Induwara Gunaratne       |

## Introduction

>[!important]
This project is a fall detection app capable of detecting if a person is in the process or at a risk of falling in isolated conditions. The premise of this project is to further provide information to health officials and create an alert systen to alert users of their being a risk of the patient falling

To summarize here are the main features of the application:
- Inclusive of IOT devices such as accelorometers and heart rate sensors
- Inclusive of a computer vision model for joint based fall detections
    - The model is an occlusion model capable of assessing visibility
- Consists of alert system to send alerts to a users device either through SMS or the website itseld
 
Although fairly new and indecisive, the project is almost completely finished with a few outscopes to satisy before projecting it as a finalized application.

## Project Management Methodology

The entire project was staged on a Jira board to meet time constraints and distribute workloads in an equittable manner. Furthermore, for a temporary period GitHub projects were staged to set timelines and see how issues were created and distributed over time

## Folder Structure

```typescript
fall_detection_project // main (django based) app 
|
|-camera_feed // content for camera page
|-dashboard // content for dashboard page
|-fall_detection_project // main app manager
|-media // output folder for each models predicitions
|-profile_page // profile editor page
|-weekly_report // weekly report page
|
model_demonstration
|
|-camera_model_component-Ethan
|-|-Camera_Page // Content for html, css, js for the camera page assessment
|-|-Fall_Detection // Content for EDA carried out to assess fall detection/joint based models performance 
|=models // content for models for each component
|-output // output folder for predictions of each model
|
Report_Contents // Report related content over time
```

## Pre-requisites 

Ensure that you've installed all the content specified in the `Requirements.txt` file in order to stage and prepare the environment to host the application. Here is the command to run it at a glance:

```bash
pip install -r Requirements.txt
```

## What to run?

To assess the performance of each model look into **model_demonstration**, thereafter to run the app simply run the following commands:

1. When in the `CM2603-DATA_SCIENCE_PROJECT_G20`:

```bash
cd .\fall_detection_project\
```

2. Run the following command to start the server:

```bash
python manage.py runserver
```
## What to view?

- If you wish to see the EDA carried out per each model look into the `model_demonstration` folder
- If you wish to run the application and view its contents view the `fall_detection_project` folder
- If you wish to see the report-based content for documenting the entire project view the `Report Contents` folder

## Cloning the repository

```bash
git clone https://github.com/ethanchristoff/CM2603-Data_Science_Project-G20.git
```