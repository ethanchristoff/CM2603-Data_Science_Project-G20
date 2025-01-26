#include <Wire.h>
#include <MPU6050.h>
#include <SimpleKalmanFilter.h>

// Create MPU6050 object
MPU6050 mpu;

// Kalman filters for accelerometer and gyroscope data
SimpleKalmanFilter kalmanX(2, 2, 0.01); // Parameters: Process noise, Measurement noise, Estimated error
SimpleKalmanFilter kalmanY(2, 2, 0.01);
SimpleKalmanFilter kalmanZ(2, 2, 0.01);

// Low-pass filter constant (adjust as needed, 0.0 = no filtering, 1.0 = no change)
const float alpha = 0.1;

// Variables for raw, filtered, and Kalman-filtered data
int16_t rawAx, rawAy, rawAz; // Raw accelerometer values
int16_t rawGx, rawGy, rawGz; // Raw gyroscope values

float filteredAx = 0, filteredAy = 0, filteredAz = 0; // Low-pass filtered accelerometer
float filteredGx = 0, filteredGy = 0, filteredGz = 0; // Low-pass filtered gyroscope

void setup() {
  Serial.begin(9600); // Start serial communication
  Wire.begin();       // Initialize I2C communication

  // Initialize MPU6050 sensor
  mpu.initialize();

  // Test connection to MPU6050
  if (mpu.testConnection()) {
    Serial.println("MPU6050 connected successfully!");
  } else {
    Serial.println("MPU6050 connection failed!");
    while (1); // Halt program if connection fails
  }
}

void loop() {
  // Read raw data from MPU6050
  mpu.getMotion6(&rawAx, &rawAy, &rawAz, &rawGx, &rawGy, &rawGz);

  // Apply low-pass filter to raw data
  filteredAx = alpha * rawAx + (1 - alpha) * filteredAx;
  filteredAy = alpha * rawAy + (1 - alpha) * filteredAy;
  filteredAz = alpha * rawAz + (1 - alpha) * filteredAz;
  filteredGx = alpha * rawGx + (1 - alpha) * filteredGx;
  filteredGy = alpha * rawGy + (1 - alpha) * filteredGy;
  filteredGz = alpha * rawGz + (1 - alpha) * filteredGz;

  // Apply Kalman filter for additional smoothing
  float kalmanAx = kalmanX.updateEstimate(filteredAx);
  float kalmanAy = kalmanY.updateEstimate(filteredAy);
  float kalmanAz = kalmanZ.updateEstimate(filteredAz);

  // Print results
  Serial.print("Accel (g): Kalman X=");
  Serial.print(kalmanAx / 16384.0, 2);
  Serial.print(" Y=");
  Serial.print(kalmanAy / 16384.0, 2);
  Serial.print(" Z=");
  Serial.print(kalmanAz / 16384.0, 2);

  Serial.print(" | Gyro (deg/s): Kalman X=");
  Serial.print(filteredGx / 131.0, 2);
  Serial.print(" Y=");
  Serial.print(filteredGy / 131.0, 2);
  Serial.print(" Z=");
  Serial.println(filteredGz / 131.0, 2);

  delay(500); // Wait 500ms before the next reading
}
