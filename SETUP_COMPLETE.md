# Smart Pantry - Setup Complete ✓

## Installation Summary

All required dependencies have been successfully installed on Linux:

### Backend (.NET)
- **.NET SDK**: 10.0.107 ✓
- **ASP.NET Core Runtime**: 10.0.7 ✓
- **Entity Framework Core**: 10.0.7 ✓
- **Database Drivers**: SQL Server, PostgreSQL ✓
- **Location**: `/home/matei/Documents/Proiecte/Smart_Pantry/PantryApi`

### Frontend (React Native/Expo)
- **Node.js**: v20.20.2 ✓
- **npm**: 10.8.2 ✓
- **Expo CLI**: Installed via npm ✓
- **React Native**: 0.81.5 ✓
- **Dependencies**: 912 packages installed ✓
- **Location**: `/home/matei/Documents/Proiecte/Smart_Pantry/PantryMobile`

### Database
- **PostgreSQL**: 16.13 ✓
- **Status**: Running and enabled ✓

## Running the Project

### Backend (PantryApi)
```bash
cd PantryApi
dotnet run
```
The API will start on `https://localhost:5001`

### Frontend (PantryMobile)
```bash
cd PantryMobile
npm start
# or for specific platforms:
npm run android
npm run ios
npm run web
```

## Next Steps

1. **Configure Database Connection**
   - Update connection string in `PantryApi/appsettings.json` if needed
   - Default uses PostgreSQL (configured in DbContext)

2. **Run Database Migrations** (if needed)
   ```bash
   cd PantryApi
   dotnet ef database update
   ```

3. **Start Backend**
   ```bash
   cd PantryApi
   dotnet run
   ```

4. **Start Frontend**
   ```bash
   cd PantryMobile
   npm start
   ```

## Verification Commands

```bash
# Check .NET version
dotnet --version

# Check Node.js version
node --version

# Check npm version
npm --version

# Check PostgreSQL status
systemctl status postgresql

# Check installed npm packages
cd PantryMobile
npm list
```

## Environment Setup

To use the installed Node.js version via nvm in the future:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20
```

## Troubleshooting

- If you encounter Node version issues, ensure nvm is sourced: `source ~/.bashrc`
- PostgreSQL can be restarted with: `sudo systemctl restart postgresql`
- Clear npm cache if needed: `npm cache clean --force`
