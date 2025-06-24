# Fallguard PRO Setup Guide

## Group Members
| Person No. | IIT ID   | RGU ID  | Student Name                    |
| ---------- | -------- | ------- | ------------------------------- |
| 1          | 20221812| 2331419 | Moderage Ethan Christoff PereraWickramage       |
| 2          | 20230903 | 2330903 | Himansa Wathsiluni Jayasuriya   |
| 3          | 20220950 | 2330973 | Senuli Laknara |
| 4          | 20232429 | 2330893 | Mevinu Induwara Gunaratne       |

## Introduction

>This project is a fall detection app capable of detecting if a person is in the process or at a risk of falling in isolated conditions. The premise of this project is to further provide information to health officials and create an alert systen to alert users of their being a risk of the patient falling

To summarize here are the main features of the application:
- Inclusive of IOT devices such as accelorometers and heart rate sensors
- Inclusive of a computer vision model for joint based fall detections
    - The model is an occlusion model capable of assessing visibility
- Consists of alert system to send alerts to a users device either through SMS or the website itseld
 
Although fairly new and indecisive, the project is almost completely finished with a few outscopes to satisy before projecting it as a finalized application.

## Features
### Dashboard Page
The dashboard page provides an intuitive interface for users to monitor real-time data and analytics. It displays fall detection alerts, vital statistics, and historical trends, enabling users and health officials to make informed decisions.

### Weekly Report Page
The weekly report page generates detailed summaries of user activity, fall detection events, and health metrics. These reports are designed to provide actionable insights and can be exported for further analysis or sharing with healthcare professionals.

### User Profile Setup Page
The user profile setup page allows users to customize their profiles, including personal information, emergency contact details, and notification preferences. This ensures that alerts and reports are tailored to individual needs.

### Camera Feed Page
The camera feed page integrates live video streaming for real-time monitoring. It also supports the computer vision model by providing visual data for joint-based fall detection, enhancing the accuracy and reliability of the system.

### Movement Model
The application integrates an accelerometer and gyroscope-based movement model to detect sudden changes in motion patterns. This model is capable of identifying irregular movements that may indicate a fall or a risk of falling.

### Computer Vision Model
A computer vision model is utilized for joint-based fall detection. This occlusion-aware model assesses the visibility of key body joints to determine if a person is in the process of falling or at risk of falling.

### Heart Rate and SpO2 Model
The system includes a heart rate and SpO2 monitoring model to track vital signs. Sudden changes in these metrics can serve as indicators of distress or potential health risks, complementing the fall detection mechanisms.

These features collectively enhance the application's ability to provide timely alerts and actionable insights to users and health officials.


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

Setup `UV` as your package manager in order to setup the required dependencies, refer to the following documentation to see how to do so: [link](https://docs.astral.sh/uv/getting-started/installation/)

If you want to quickly setup `UV` just run the following command or refer to the documentation above:

```bash
powershell -c "irm https://astral.sh/uv/install.ps1 | more"
```

Once you've setup UV you can run the following command to setup the dependencies using the `Requirements.txt`:

```bash
uv install -r Requirements.txt
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
