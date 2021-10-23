export const createTextFileWithCreds = ({ email, password }: { email: string; password: string }) => {
  const element = document.createElement('a')
  const file = new Blob([`Email: ${email}\nPassword: ${password}`], { type: 'text/plain' })
  element.href = URL.createObjectURL(file)
  element.download = `${email}.txt`
  document.body.appendChild(element) // Required for this to work in FireFox
  element.click()
}
