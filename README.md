# casino_online

## How to run?

### 1. Clone the repository:
   ```bash
   git clone https://github.com/marcino10/casino_online.git
   ```
   
### 2. Install the dependencies:
   ```bash
   npm install
   ```
   
### 3. Build the docker:
   ```bash
   docker compose up --build
   ```

### 4. Migrate the database:
   ```bash
   docker compose run migrate
   ```

### 5. Open the browser and go to:
   ```
   http://localhost:3000
   ```

### There are 6 test users with the following credentials:
#### 1. login: 'test', 'test1', 'test2', 'test3', 'test4', 'test5'
#### 2. password: 'test123'

### How to delete the database?:
```bash
docker compose run rollback
```