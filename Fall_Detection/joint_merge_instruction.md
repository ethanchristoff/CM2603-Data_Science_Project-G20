# Pre-requisites 

Some of the libraries you need to have installed before executing the models include the following for active joint processing and a live feed:
- OpenCV (For an active camera feed)
- Mediapipe (for active joint projections and calculations)
- Scikit-learn (to develop/train the models)
- pandas (to read through the csv file)

# How to setup the models

There are two main components you need in order to create a functional model, the `image_train_pose_coordinates.csv` file and the `fall_detection_notebook.ipynb` as it contains the main code to train each model.

Regard the following points to understand how the code and models work:
- In the csv file there are joint coordinates with outcomes and visibility ratings, each model reads into that and understands what each pose should fit into in order to be considered as a 'fall' or 'non-fall'
- What you need to do is fit it into the provided models in the notebook file and settle on which one performs the best (most likely the KNN model)
- In order to set the active/live feed for detecting falls make sure you have openCV installed
- Thereafter setting up the required libraries and dependencies ensure that you standardize and normalize the data as shown in the notebook file

# How to merge it with the other models?

The logic behind the code is that it will detect any fall (for any duration) recorded within its runtime. If a fall were to last over 5 seconds in any given time it will be detected. So, what you should do is detect if a fall lasts for over 5 seconds and if it does the model is confirming that a person is in a fall-related position.

Use the remaining data to produce a weekly report, the provided code already includes a segment to output all of its collected data into a csv file to fit the data values into a weekly report based graph projecting how many detected falls there were within a week