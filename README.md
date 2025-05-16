# traffic-controller
Smart traffic light system using Arduinos

### Prerequisites
- Python installed
- Node.js installed. Download [here](https://nodejs.org/en/download/)
- Arduino IDE installed. Download [here](https://www.arduino.cc/en/software)


### Web application instructions
1. Clone the repository
```bash
git clone https://github.com/NontasBak/traffic-controller.git
```
2. Navigate to the root directory of the repository
```bash
cd traffic-controller
```
3. Navigate to the backend, create a virtual environment and install the dependencies
```bash
cd backend
python3 -m venv venv/ # for Windows: py -m venv venv\
source venv/bin/activate
pip install -r requirements.txt
```
4. Run the backend
```bash
python app.py
```
5. On a different terminal, navigate to the frontend directory and install the dependencies
```bash
cd frontend
npm install
```
6. Run the development server
```bash
npm run dev
```
7. Vite will display a local server URL, navigate to it (usually http://localhost:5173)


### Arduino instructions
TODO