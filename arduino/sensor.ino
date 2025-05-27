int val = 0;
int threshold = 30;

void setup() {
  Serial.begin(9600);
  pinMode(3, OUTPUT);
}

void loop() {
  val = analogRead(3);
  Serial.println(val);

  if(val > threshold) {
    digitalWrite(3, HIGH);
  } else {
    digitalWrite(3, LOW);
  }

  delay(100);
}