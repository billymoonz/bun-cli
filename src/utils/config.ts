import * as fs from "fs"
import * as yaml from "js-yaml"

export class Config<T> {
  private readonly name: string
  private readonly defaultConfig: T

  constructor(name: string, defaultConfig: T) {
    this.name = name
    this.defaultConfig = defaultConfig
    this.ensureConfigFileExists()
  }

  private ensureConfigFileExists(): void {
    if (!fs.existsSync(this.name)) {
      this.writeConfig(this.defaultConfig)
    } else {
      try {
        fs.readFileSync(this.name, "utf8")
      } catch (e) {
        console.warn(
          `Config file corrupted or unreadable: ${e}. Rewriting with default configuration.`
        )
        this.writeConfig(this.defaultConfig)
      }
    }
  }

  private readConfig(): T {
    try {
      const fileContents = fs.readFileSync(this.name, "utf8")
      return yaml.load(fileContents) as T
    } catch (e) {
      console.warn(
        `Failed to read config file: ${e}. Using default configuration.`
      )
      return this.defaultConfig
    }
  }

  private writeConfig(configData: T): void {
    try {
      const yamlStr = yaml.dump(configData)
      fs.writeFileSync(this.name, yamlStr, "utf8")
    } catch (e) {
      console.error(`Failed to write config file: ${e}`)
    }
  }

  public setValue<K extends keyof T>(key: K, value: T[K]): void {
    const configData = this.readConfig()
    configData[key] = value
    this.writeConfig(configData)
  }

  public getValue<K extends keyof T>(key: K): T[K] {
    const configData = this.readConfig()
    return configData[key]
  }

  public getConfig(): T {
    return this.readConfig()
  }
}
