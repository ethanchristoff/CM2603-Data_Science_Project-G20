#include <Wire.h>

void setup() {
  Serial.begin(115200);
  Wire.begin();

  Serial.println("Checking MPU6050 at 0x68...");
  Wire.beginTransmission(0x68);
  if (Wire.endTransmission() == 0) {
    Serial.println("MPU6050 detected at 0x68!");
    return;
  }

  Serial.println("Checking MPU6050 at 0x69...");
  Wire.beginTransmission(0x69);
  if (Wire.endTransmission() == 0) {
    Serial.println("MPU6050 detected at 0x69!");
    return;
  }

  Serial.println("No MPU6050 found! Check wiring.");
}

void loop() {}
