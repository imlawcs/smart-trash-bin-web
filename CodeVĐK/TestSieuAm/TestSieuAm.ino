#define TRIG1 2
#define ECHO1 3
#define TRIG2 4
#define ECHO2 5
#define TRIG3 6
#define ECHO3 7
#define TRIG4 8
#define ECHO4 9

#define SIGNAL1 10
#define SIGNAL2 11
#define SIGNAL3 12
#define SIGNAL4 13

long readDistance(int trig, int echo) {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);
  long duration = pulseIn(echo, HIGH, 30000);  // timeout 30ms
  long distance = duration * 0.034 / 2;
  return distance;
}

void setup() {
  Serial.begin(115200);

  pinMode(TRIG1, OUTPUT); pinMode(ECHO1, INPUT);
  pinMode(TRIG2, OUTPUT); pinMode(ECHO2, INPUT);
  pinMode(TRIG3, OUTPUT); pinMode(ECHO3, INPUT);
  pinMode(TRIG4, OUTPUT); pinMode(ECHO4, INPUT);

  pinMode(SIGNAL1, OUTPUT);
  pinMode(SIGNAL2, OUTPUT);
  pinMode(SIGNAL3, OUTPUT);
  pinMode(SIGNAL4, OUTPUT);

  digitalWrite(SIGNAL1, LOW);
  digitalWrite(SIGNAL2, LOW);
  digitalWrite(SIGNAL3, LOW);
  digitalWrite(SIGNAL4, LOW);
}

void loop() {
  long d1 = readDistance(TRIG1, ECHO1);
  long d2 = readDistance(TRIG2, ECHO2);
  long d3 = readDistance(TRIG3, ECHO3);
  long d4 = readDistance(TRIG4, ECHO4);

  if (d1 > 0 && d1 < 10) {
    Serial.print("📏 Cảm biến 1: "); Serial.print(d1); Serial.println(" cm");
  }
  if (d2 > 0 && d2 < 10) {
    Serial.print("📏 Cảm biến 2: "); Serial.print(d2); Serial.println(" cm");
  }
  if (d3 > 0 && d3 < 10) {
    Serial.print("📏 Cảm biến 3: "); Serial.print(d3); Serial.println(" cm");
  }
  if (d4 > 0 && d4 < 10) {
    Serial.print("📏 Cảm biến 4: "); Serial.print(d4); Serial.println(" cm");
  }

  digitalWrite(SIGNAL1, (d1 > 0 && d1 < 10) ? HIGH : LOW);
  digitalWrite(SIGNAL2, (d2 > 0 && d2 < 10) ? HIGH : LOW);
  digitalWrite(SIGNAL3, (d3 > 0 && d3 < 10) ? HIGH : LOW);
  digitalWrite(SIGNAL4, (d4 > 0 && d4 < 10) ? HIGH : LOW);

  delay(300); // nghỉ giữa các lần đo
}
