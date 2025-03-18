# Project File Structure

The following code snippet will point out the file structure for the camera feed page such that its workflow and important files and apps are mentioned:

```typescript
fall_detection_project (main project folder)
|->fall_detection_project (main project file)
|   |->settings.py (apps,static/media files)
|   |->urls.py(paths to all sub-apps)
|   |->_init_.py
|   |->asgi.py
|   |->wsgi.py
|->camera_feed
|   |->static
|   |   |->CSS
|   |   |   |->camera.css
|   |   |->JS
|   |   |   |->camera.js
|   |   |->KNN_model
|   |   |   |->knn_model.pkl
|   |   |   |->scaler.pkl
|   |   |   |->train_test_split.pkl
|   |->templates
|   |   |->camera_feed.html
|   |->_init_.py
|   |->admin.py
|   |->apps.py
|   |->models.py
|   |->tests.py
|   |->urls.py
|   |->views.py
|->media
|   |->recordings
````

In order to stage and enable django to use the media file to output recordings and `csv` file outputs ensure that you use the same code in the `settings.py` file in the "fall_detection_project (main project folder)" folder. The workflow is like so:

Run camera model -> models loaded from static environment alongside template components (css,js) ->Data outputted into media file 