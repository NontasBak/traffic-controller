#include <RF22.h>
#include <RF22Router.h>
#include <SPI.h>

#define MY_ADDRESS 14
#define DESTINATION_ADDRESS 5

RF22Router rf22(MY_ADDRESS);

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

bool detect_cars() {
  return random(0, 10) > 7;
}

void send_rf_message(const char* message) {
  uint8_t data_send[RF22_ROUTER_MAX_MESSAGE_LEN];
  memset(data_send, '\0', RF22_ROUTER_MAX_MESSAGE_LEN);
  strncpy((char*)data_send, message, RF22_ROUTER_MAX_MESSAGE_LEN - 1);

  successful_packet = false;
  while (!successful_packet) {
    if (rf22.sendtoWait(data_send, strlen((char*)data_send), DESTINATION_ADDRESS) != RF22_ROUTER_ERROR_NONE) {
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

  // Set traffic light pins
  pinMode(green_x, OUTPUT);
  pinMode(green_y, OUTPUT);
  pinMode(red_x, OUTPUT);
  pinMode(red_y, OUTPUT);
  set_green('x');

  // Init RFM22 module
  if (!rf22.init())
    Serial.println("RF22 init failed");

  if (!rf22.setFrequency(431.0))
    Serial.println("setFrequency Fail");

  rf22.setTxPower(RF22_TXPOW_20DBM);
  rf22.setModemConfig(RF22::GFSK_Rb125Fd125);
  rf22.addRouteTo(DESTINATION_ADDRESS, DESTINATION_ADDRESS);

  randomSeed(analogRead(A0));
  Serial.println("Traffic light RF sender ready");
}

void loop() {
  bool cars_waiting_y = detect_cars();
  set_green('x');
  send_rf_message(cars_waiting_y ? "GREEN:X, CARS_Y:YES" : "GREEN:X, CARS_Y:NO");
  delay(cars_waiting_y ? fastDelay : baseDelay);

  bool cars_waiting_x = detect_cars();
  set_green('y');
  send_rf_message(cars_waiting_x ? "GREEN:Y, CARS_X:YES" : "GREEN:Y, CARS_X:NO");
  delay(cars_waiting_x ? fastDelay : baseDelay);
}
