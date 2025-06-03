#include <RF22.h>
#include <RF22Router.h>
#include <SPI.h>
#include "Ultrasonic.h"

#define MY_ADDRESS 1488

#define DESTINATION_ADDRESS 420

RF22Router rf22(MY_ADDRESS);
Ultrasonic ultrasonic(A0,A1);

// Traffic light pins
const int green_x = 8;
const int green_y = 7;
const int red_x = 12;
const int red_y = 13;

const unsigned long baseDelay = 5000;
const unsigned long fastDelay = 3000;

long randNumber;
bool successful_packet = false;
int max_delay = 3000;

void set_green(char road) {
    if (road == 'x') {
        digitalWrite(green_x, HIGH);
        digitalWrite(red_x, LOW);
        digitalWrite(green_y, LOW);
        digitalWrite(red_y, HIGH);

    } else if (road == 'y') {
        digitalWrite(green_y, HIGH);
        digitalWrite(red_y, LOW);
        digitalWrite(green_x, LOW);
        digitalWrite(red_x, HIGH);
    }
}

bool detect_cars() { return random(0, 10) > 7; }

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
    pinMode(green_x, OUTPUT);
    pinMode(green_y, OUTPUT);
    pinMode(red_x, OUTPUT);
    pinMode(red_y, OUTPUT);

    set_green('x');
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

// Ticks happen every MS_WAIT milliseconds
long MS_WAIT = 500;
long counter_light_change = 0; // Measures how many ticks since last light change
long counter_message_send = 0; // Measures how many ticks since last message sent

long weight_counter = 0;
long weight_sum = 0;

long GREEN_SECONDS = 5;
long YELLOW_SECONDS = 2;
long RED_SECONDS = 40;

long READINGS_PER_SECOND = 1000 / MS_WAIT;
long TICKS_GREEN = GREEN_SECONDS * 1000 / MS_WAIT;
long TICKS_YELLOW = YELLOW_SECONDS * 1000 / MS_WAIT;
long TICKS_RED = RED_SECONDS * 1000 / MS_WAIT;

long THRESHOLD_NO_CARS = 250; // No cars detected
long THRESHOLD_1_CAR = 500; // One car detected
long THRESHOLD_2_CARS = 750; // Two cars detected

// For speed radar
long counter_car_passing = 0;
long counter_total_ticks_since_car_passed = 0;
long THRESHOLD_CAR_PASSING = 10; // Distance in cm to consider a car passing in front of the sensor
long THRESHOLD_TICKS_FAST_SPEED = 5;
long THRESHOLD_TICKS_TOTAL_CHECKING = 10; // How many ticks to check
bool car_passing = false;

bool fast_speed = false;
long counter_fast_speed = 0;
long FAST_SPEED_SECONDS = 3; // How many seconds to send a message that a car was going fast
long FAST_SPEED_TICKS = FAST_SPEED_SECONDS * 1000 / MS_WAIT;


enum Light {
    GREEN,
    YELLOW,
    RED
};

enum Cars {
    NO_CARS,
    ONE_CAR = 5,
    TWO_CARS = 10,
    MANY_CARS = 15
};

Light current_light = RED;
Cars current_cars = NO_CARS;

void loop() {
    val = analogRead(3);
    // Serial.println(val);
    distance = ultrasonic.Ranging(CM);

    // Traffic light logic
    switch (current_light) {
        case GREEN:
            if(counter_light_change < TICKS_GREEN) {
                counter_light_change++;
            } else {
                current_light = YELLOW;
                counter_light_change = 0;
            }
            break;
        case YELLOW:
            if(counter_light_change < TICKS_YELLOW) {
                counter_light_change++;
            } else {
                current_light = RED;
                counter_light_change = 0;
            }
            break;
        case RED:
            if (weight_counter < READINGS_PER_SECOND && counter_light_change < TICKS_RED) {
                weight_counter++;
                weight_sum += val;
            } else if (weight_counter >= READINGS_PER_SECOND) {
                int weight_average = weight_sum / READINGS_PER_SECOND;

                Serial.print("Weight average: ");
                Serial.println(weight_average);

                weight_counter = 0;
                weight_sum = 0;
                
                if (weight_average < THRESHOLD_NO_CARS) {
                    current_cars = NO_CARS;
                } else if (weight_average < THRESHOLD_1_CAR) {
                    current_cars = ONE_CAR;
                } else if (weight_average < THRESHOLD_2_CARS) {
                    current_cars = TWO_CARS;
                } else {
                    current_cars = MANY_CARS;
                }

                counter_light_change += READINGS_PER_SECOND * current_cars;
            } else {
                current_light = GREEN;
                counter_light_change = 0;
            }
            break;
        default:
            break;
    }

    // Calculate time remaining until light changes (in seconds)
    int light_timer_seconds = 0;
    switch (current_light) {
        case GREEN:
            light_timer_seconds = (TICKS_GREEN - counter_light_change) * MS_WAIT / 1000;
            break;
        case YELLOW:
            light_timer_seconds = (TICKS_YELLOW - counter_light_change) * MS_WAIT / 1000;
            break;
        case RED:
            light_timer_seconds = (TICKS_RED - counter_light_change) * MS_WAIT / 1000;
            break;
    }

    // Speed radar logic
    car_passing = distance < THRESHOLD_CAR_PASSING;
    if (!fast_speed) {
        if (!counter_total_ticks_since_car_passed) {
            // Start tick timer if car passes
            if (car_passing) {
                counter_total_ticks_since_car_passed++;
            }
        } else if (counter_total_ticks_since_car_passed < THRESHOLD_TICKS_TOTAL_CHECKING) {
            counter_total_ticks_since_car_passed++;
            
            // Continue checking if car is passing
            if (car_passing) {
                counter_car_passing++;
            }
        } else {
            counter_total_ticks_since_car_passed = 0;
    
            // Evaluate if car was going fast
            if (1 < counter_car_passing && counter_car_passing < THRESHOLD_TICKS_FAST_SPEED) {
                fast_speed = true;
            } else {
                fast_speed = false;
            }
        }
    } else if (counter_fast_speed < FAST_SPEED_TICKS) {
        counter_fast_speed++;
    } else {
        fast_speed = false;
        counter_fast_speed = 0;
    }

    // Send message every second
    if (counter_message_send >= READINGS_PER_SECOND) {
        char message[20];
        sprintf(message, "%d,%d,%d", current_light, light_timer_seconds, fast_speed);
        Serial.println(message);
        send_rf_message(message);

        counter_message_send = 0;
    }

    delay(MS_WAIT);
    counter_message_send++;
}