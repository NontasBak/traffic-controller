#include <RF22.h>
#include <RF22Router.h>
#include <SPI.h>
#include "Ultrasonic.h"

#define MY_ADDRESS 9876

#define DESTINATION_ADDRESS 420

RF22Router rf22(MY_ADDRESS);
Ultrasonic ultrasonic(A0,A1);

// Traffic light pins
const int light_red = 8;
const int light_yellow = 3;
const int light_green = 7;

const unsigned long baseDelay = 5000;
const unsigned long fastDelay = 3000;

long randNumber;
bool successful_packet = false;
int max_delay = 3000;

void send_rf_message(const char* message) {
    uint8_t data_send[RF22_ROUTER_MAX_MESSAGE_LEN];
    memset(data_send, '\0', RF22_ROUTER_MAX_MESSAGE_LEN);
    strncpy((char*)data_send, message, RF22_ROUTER_MAX_MESSAGE_LEN - 1);

    successful_packet = false;
    while (!successful_packet) {
        if (rf22.sendtoWait(data_send, strlen((char*)data_send),
                            DESTINATION_ADDRESS) != RF22_ROUTER_ERROR_NONE) {
            Serial.println("sendtoWait failed");
            randNumber = random(200, max_delay);
            delay(randNumber);

        } else {
            successful_packet = true;
            Serial.print("Sent: ");
            Serial.println(message);
        }
    }
}

void setup() {
    Serial.begin(9600);
    pinMode(3, OUTPUT);

    // Set traffic light pins
    pinMode(light_red, OUTPUT);
    pinMode(light_yellow, OUTPUT);
    pinMode(light_green, OUTPUT);

    // Init RFM22 module
    if (!rf22.init()) Serial.println("RF22 init failed");
    if (!rf22.setFrequency(431.0)) Serial.println("setFrequency Fail");

    rf22.setTxPower(RF22_TXPOW_20DBM);
    rf22.setModemConfig(RF22::GFSK_Rb125Fd125);
    rf22.addRouteTo(DESTINATION_ADDRESS, DESTINATION_ADDRESS);

    randomSeed(analogRead(A0));
    Serial.println("Traffic light RF sender ready");
}

long val = 0;
long distance = 0;

// Duration constants in milliseconds
const unsigned long GREEN_DURATION = 5000;  // 5 seconds
const unsigned long YELLOW_DURATION = 3000; // 3 seconds
const unsigned long RED_DURATION = 60000;   // 60 seconds

// Message sending interval
const unsigned long MESSAGE_INTERVAL = 1000; // 1 second

// Thresholds for car detection
const long THRESHOLD_NO_CARS = 15;  // No cars detected
const long THRESHOLD_1_CAR = 200;   // One car detected
const long THRESHOLD_2_CARS = 400;  // Two cars detected

// For speed radar
const long THRESHOLD_CAR_PASSING = 10; // Distance in cm to consider a car passing
const unsigned long FAST_SPEED_DURATION = 3000; // How long to report a car was speeding (3 seconds)
bool car_passing = false;
bool fast_speed = false;
unsigned long fast_speed_start_time = 0;

// Speed detection parameters
const unsigned long SPEED_CHECK_DURATION = 500; // Time window to check car speed (500ms)
const unsigned long FAST_SPEED_THRESHOLD = 250; // Time threshold for fast car detection (ms)
unsigned long car_passing_start_time = 0;
unsigned long car_passing_duration = 0;
bool speed_check_active = false;

enum Light {
    GREEN,
    YELLOW,
    RED
};

// The weights here show how much timer decrease should happen on each threshold
enum Cars {
    NO_CARS = 1,
    ONE_CAR = 5,
    TWO_CARS = 10,
    MANY_CARS = 15
};

Light current_light = RED;
Cars current_cars = NO_CARS;

// Timing variables
unsigned long light_change_time = 0;    // When the current light state started
unsigned long last_message_time = 0;    // When the last message was sent
unsigned long last_weight_check_time = 0; // When we last checked the weight
unsigned long red_light_decrease = 0;  // Time decrease for RED light based on car presence

void loop() {
    unsigned long current_time = millis();
    val = analogRead(3);
    distance = ultrasonic.Ranging(CM);

    // Traffic light logic
    switch (current_light) {
        case GREEN:
            if (current_time - light_change_time < GREEN_DURATION) {
                // Keep GREEN state
                digitalWrite(light_green, HIGH);
                digitalWrite(light_yellow, LOW);
                digitalWrite(light_red, LOW);
            } else {
                // Transition to YELLOW
                digitalWrite(light_green, LOW);
                digitalWrite(light_yellow, HIGH);
                digitalWrite(light_red, LOW);
                
                current_light = YELLOW;
                light_change_time = current_time;
            }
            break;
            
        case YELLOW:
            if (current_time - light_change_time < YELLOW_DURATION) {
                // Keep YELLOW state
                digitalWrite(light_green, LOW);
                digitalWrite(light_yellow, HIGH);
                digitalWrite(light_red, LOW);
            } else {
                // Transition to RED
                digitalWrite(light_green, LOW);
                digitalWrite(light_yellow, LOW);
                digitalWrite(light_red, HIGH);
                
                current_light = RED;
                light_change_time = current_time;
                red_light_decrease = 0; // Reset extension when entering red light
            }
            break;
            
        case RED:
            // Check weight every second during red light
            if (current_time - last_weight_check_time >= 1000) {
                Serial.print("Weight: ");
                Serial.println(val);
                
                // Update car count based on weight
                if (val < THRESHOLD_NO_CARS) {
                    current_cars = NO_CARS;
                } else if (val < THRESHOLD_1_CAR) {
                    current_cars = ONE_CAR;
                } else if (val < THRESHOLD_2_CARS) {
                    current_cars = TWO_CARS;
                } else {
                    current_cars = MANY_CARS;
                }
                
                // When cars are detected, reduce the red light duration
                if (current_cars > NO_CARS) {
                    unsigned long time_elapsed = current_time - light_change_time;
                    unsigned long remaining_time = RED_DURATION > time_elapsed ? 
                                                   RED_DURATION - time_elapsed : 0;
                    
                    // Calculate how much to reduce (based on car count)
                    unsigned long reduction = min(remaining_time, (unsigned long)current_cars * 1000);
                    red_light_decrease += reduction;
                }
                
                last_weight_check_time = current_time;
            }
            
            // Calculate the time remaining for RED light
            unsigned long time_elapsed = current_time - light_change_time;
            unsigned long adjusted_duration = RED_DURATION > red_light_decrease ? 
                                              RED_DURATION - red_light_decrease : 0;
            
            // Keep RED state
            digitalWrite(light_green, LOW);
            digitalWrite(light_yellow, LOW);
            digitalWrite(light_red, HIGH);
            
            // Check if red light duration has passed
            if (time_elapsed >= adjusted_duration || adjusted_duration == 0) {
                // Transition to GREEN
                digitalWrite(light_green, HIGH);
                digitalWrite(light_yellow, LOW);
                digitalWrite(light_red, LOW);
                
                current_light = GREEN;
                light_change_time = current_time;
            }
            break;
            
        default:
            break;
    }

    // Calculate time remaining until light changes (in seconds)
    int light_timer_seconds = 0;
    switch (current_light) {
        case GREEN:
            light_timer_seconds = (GREEN_DURATION - (current_time - light_change_time)) / 1000;
            break;
        case YELLOW:
            light_timer_seconds = (YELLOW_DURATION - (current_time - light_change_time)) / 1000;
            break;
        case RED:
            // Calculate red light time by subtracting the extension
            light_timer_seconds = (RED_DURATION - red_light_decrease - (current_time - light_change_time)) / 1000;
            break;
    }
    light_timer_seconds = max(0, light_timer_seconds);

    // Speed radar logic
    car_passing = distance < THRESHOLD_CAR_PASSING;
    
    // Start timing when car first passes
    if (car_passing && !speed_check_active) {
        car_passing_start_time = current_time;
        speed_check_active = true;
    }
    
    // Check if car passed quickly
    if (speed_check_active) {
        if (!car_passing) { // Car is no longer detected
            car_passing_duration = current_time - car_passing_start_time;
            
            // If car passed faster than threshold, mark as speeding
            if (car_passing_duration < FAST_SPEED_THRESHOLD) {
                fast_speed = true;
                fast_speed_start_time = current_time;
            }
            
            speed_check_active = false;
        } else if (current_time - car_passing_start_time > SPEED_CHECK_DURATION) {
            // Timeout for speed check
            speed_check_active = false;
        }
    }
    
    // Reset fast_speed flag after duration expires
    if (fast_speed && current_time - fast_speed_start_time >= FAST_SPEED_DURATION) {
        fast_speed = false;
    }

    // Send message every second, regardless of other operations
    if (current_time - last_message_time >= MESSAGE_INTERVAL) {
        char message[20];
        sprintf(message, "%d,%d,%d", current_light, light_timer_seconds, fast_speed);
        Serial.println(message);
        send_rf_message(message);
        
        last_message_time = current_time;
    }

    delay(10); // Short delay for stability
}