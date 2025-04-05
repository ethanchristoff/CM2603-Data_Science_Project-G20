BEGIN
    FUNCTION get_camera_page(request)
        recordings_dir ← concatenate(settings.MEDIA_ROOT, "/", "recordings")

        video_files ← EMPTY_LIST
        IF path_exists(recordings_dir) THEN
            FOR each file in list_directory(recordings_dir) DO
                IF file ends_with(".mp4") OR file ends_with(".avi") OR file ends_with(".mov") THEN
                    append(video_files, file)
                END IF
            END FOR
        END IF

        context ← { "videos": video_files }

        RETURN render_template(request, "camera_feed.html", context)
    END FUNCTION

    FUNCTION gen_frames()
        base_dir ← get_parent_directory(get_parent_directory(get_absolute_path(__file__)))
        model_dir ← concatenate_paths(settings.BASE_DIR, "fallguard_pro", "static", "KNN_model")
        scaler_path ← concatenate_paths(model_dir, "scaler.pkl")
        model_path ← concatenate_paths(model_dir, "knn_model.pkl")

        TRY
            scaler ← load_model(scaler_path)
            model_file ← open_file(model_path, "rb")
            knn_model ← load_pickle(model_file)
        CATCH error
            PRINT "Error loading model: ", error
            YIELD NULL
            RETURN
        END TRY

        mp_pose ← initialize_pose_module()
        mp_drawing ← initialize_drawing_utils()
        non_face_indices ← [11 to 32]

        cap ← open_camera(0)
        IF camera_not_opened(cap) THEN
            PRINT "Error: Could not open camera."
            RETURN
        END IF

        recordings_dir ← concatenate_paths(settings.MEDIA_ROOT, "recordings")
        create_directory_if_not_exists(recordings_dir)

        log_filename ← "fall_detection_log.csv"
        log_path ← concatenate_paths(settings.MEDIA_ROOT, log_filename)
        create_directory_if_not_exists(get_parent_directory(log_path))

        log_file ← open_file(log_path, "w")
        writer ← create_csv_writer(log_file)
        write_csv_row(writer, ["Timestamp", "Status"])

        fall_start_time ← NULL
        non_fall_start_time ← get_current_time()
        recording ← FALSE
        video_filename ← NULL
        fall_video_writer ← NULL
        fourcc ← define_video_codec("mp4v")

        pose ← initialize_pose(min_detection_confidence=0.3, min_tracking_confidence=0.3)
        WHILE TRUE
            success, frame ← read_frame(cap)
            IF success IS FALSE THEN
                BREAK
            END IF

            image ← resize_frame(frame, width=640, height=480)
            image_rgb ← convert_to_rgb(image)
            results ← process_pose(pose, image_rgb)

            label ← "No Pose Detected"
            IF pose_landmarks_detected(results) THEN
                height, width, _ ← get_frame_dimensions(image)
                landmarks ← get_pose_landmarks(results)
                filtered_landmarks ← filter_landmarks(landmarks, non_face_indices)

                x_coords ← extract_x_coordinates(filtered_landmarks, width)
                y_coords ← extract_y_coordinates(filtered_landmarks, height)
                visibilities ← extract_visibilities(filtered_landmarks)

                x_min, x_max ← min(x_coords), max(x_coords)
                y_min, y_max ← min(y_coords), max(y_coords)

                features_input ← [
                    mean(x_coords),
                    mean(y_coords),
                    mean(visibilities),
                    x_max - x_min,
                    y_max - y_min
                ]

                features_input_scaled ← transform_with_scaler(scaler, [features_input])
                prediction ← predict_with_model(knn_model, features_input_scaled)[0]
                label ← choose_label(prediction, "Falling", "Not Falling")

                current_time ← get_current_datetime_string()
                write_csv_row(writer, [current_time, label])

                IF prediction = 1 THEN
                    IF fall_start_time IS NULL THEN
                        fall_start_time ← get_current_time()
                        timestamp_str ← get_formatted_timestamp()
                        video_filename ← concatenate_paths(recordings_dir, concatenate_strings("fall_", timestamp_str, ".mp4"))
                        fall_video_writer ← create_video_writer(video_filename, fourcc, 20.0, (640, 480))
                        recording ← TRUE
                    END IF

                    IF recording IS TRUE THEN
                        write_frame_to_video(fall_video_writer, image)
                    END IF
                ELSE
                    IF fall_start_time IS NOT NULL THEN
                        fall_duration ← calculate_time_difference(fall_start_time)
                        IF fall_duration < 5 AND recording IS TRUE THEN
                            release_video_writer(fall_video_writer)
                            delete_file(video_filename)
                        ELSE IF fall_duration ≥ 5 AND recording IS TRUE THEN
                            release_video_writer(fall_video_writer)
                        END IF
                        fall_start_time ← NULL
                        recording ← FALSE
                    END IF
                END IF

                draw_landmarks_on_image(image, results, mp_drawing, mp_pose)
                draw_bounding_box(image, x_min, y_min, x_max, y_max, color=(0, 255, 0))
                draw_text_on_image(image, label, position=(50, 50), font_size=1, color=(0, 0, 255))

            ret, buffer ← encode_frame(image, format=".jpg")
            frame_bytes ← get_bytes_from_buffer(buffer)
            YIELD concatenate_bytes("--frame\r\n", "Content-Type: image/jpeg\r\n\r\n", frame_bytes, "\r\n")
        END WHILE

        release_camera(cap)
        IF fall_video_writer IS NOT NULL THEN
            release_video_writer(fall_video_writer)
        END IF

        PRINT concatenate_strings("Fall detection log saved to: ", log_path)
    END FUNCTION

    FUNCTION camera_feed(request)
        RETURN StreamingHttpResponse(
            gen_frames(),
            content_type = "multipart/x-mixed-replace; boundary=frame"
        )
    END FUNCTION
STOP