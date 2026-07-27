import { Button, TextField } from '@mui/material'

function LoginPage() {
  return (
    <div>
      <h1>Login Page</h1>

      <TextField
        label="E-posta"
        variant="outlined"
      />

      <Button variant="contained">
        Giriş Yap
      </Button>
    </div>
  )
}

export default LoginPage