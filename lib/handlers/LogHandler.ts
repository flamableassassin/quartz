import COLOR from 'chalk'

/** LogHandler Class */
class LogHandler {
  /**
   * Send warning to console
   * @param {string} message - The warning message
   */
  public warn (...message: any[]) {
    console.log(COLOR.yellow('[WARNING]'))
    console.warn(...message)
  }

  /**
   * Send error to console
   * @param {string} message - The error message
   */
  public error (...message: any[]) {
    console.log(COLOR.red('[ERROR]'))
    console.log(...message)
    console.trace()
  }

  /**
   * Send info to console
   * @param {string} message - The info message
   */
  public info (...message: any[]) {
    console.log(COLOR.hex('#7289DA')('[Points]: ') + COLOR.yellow(...message))
  }

  /**
   * Send console to console
   * @param {string} message - The console message
   */
  public console (...message: any[]) {
    console.log(...message)
  }
}
export default LogHandler