import { Injectable, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { CreateUserDto } from 'src/user/dto/createUserDto.dto';
import { UpdateUserDto } from 'src/user/dto/updateUserDto.dto';
import { UserService } from 'src/user/user.service';
import { WeatherResponse } from './interface/weather.interface';
import { User } from 'src/user/user.schema';
import { Cron } from '@nestjs/schedule';
import { AdminService } from 'src/admin/admin.service';
import { OnEvent } from '@nestjs/event-emitter';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: TelegramBot;
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async onModuleInit() {
    const token = this.tokenService.getToken() || process.env.TELEGRAM_API_KEY;
    if (!token) {
      throw new Error('Telegram Bot Token is not set!');
    }
    this.initializeBot(token);
  }

  private initializeBot(token: string) {
    if (this.bot) {
      console.log('Stopping existing bot polling');
      this.bot.stopPolling();
    }

    console.log('Initializing new bot instance');
    this.bot = new TelegramBot(token, { polling: true });

    if (!this.bot) {
      throw new Error('Failed to initialize bot instance');
    }

    this.registerCommands();
  }

  @Cron('*/10 * * * * *')
  handleCron() {
    this.sendWeatherUpdateToAll();
  }

  private registerCommands() {
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const username = msg.from?.username || 'Unknown';
      const firstName = msg.from?.first_name || 'User';
      const lastName = msg.from?.last_name || '';
      console.log(msg);
      let user = await this.userService.findOne(chatId);
      if (!user) {
        const createUserDto: CreateUserDto = {
          chatId,
          firstName,
          lastName,
          username,
          city: null,
          isBlocked: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        user = await this.userService.create(createUserDto);
      }
      if (!user.city) {
        this.bot.sendMessage(
          chatId,
          `Hello, ${firstName}! 🌟 Please enter your city so I can provide you with accurate weather updates.`,
        );
        this.bot.once('message', async (cityMsg) => {
          const city = cityMsg.text;
          if (city) {
            const updateUserDto: UpdateUserDto = {
              chatId,
              city,
              updatedAt: new Date(),
            };

            try {
              await this.userService.update(chatId, updateUserDto);
              this.bot.sendMessage(
                chatId,
                `Thanks, ${firstName}! I've updated your city to ${city}. 🌤️`,
              );
            } catch (error) {
              console.error('Error updating user city:', error);
              this.bot.sendMessage(
                chatId,
                `Oops! Something went wrong while updating your city. Please try again.`,
              );
            }
          } else {
            this.bot.sendMessage(
              chatId,
              `I didn't catch that. Please enter your city.`,
            );
          }
        });
      } else {
        this.bot.sendMessage(
          chatId,
          `Hello, ${firstName}! 😎 I’m your weather bot, here to keep you updated on the weather in ${user.city}.`,
        );
      }
    });

    this.bot.onText(/\/weather/, async (msg) => {
      const chatId = msg.chat.id;
      const user: User = await this.userService.findByChatId(chatId);
      if (user.isBlocked === true || !user.city) {
        return this.bot.sendMessage(
          chatId,
          'You are not subscribed to weather updates or have not set your city.',
        );
      }
      this.sendWeatherUpdate(chatId, user.city);
    });

    this.bot.onText(/\/set_city/, async (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(
        chatId,
        'Please enter your city so I can provide you with accurate weather updates.',
      );
      this.bot.once('message', async (cityMsg) => {
        const city = cityMsg.text;
        if (city) {
          const user: User = await this.userService.findByChatId(chatId);
          const updateUserDto: UpdateUserDto = {
            chatId,
            city,
            updatedAt: new Date(),
          };
          await this.userService.update(chatId, updateUserDto);
          this.bot.sendMessage(chatId, `Your city has been set to ${city}.`);
        } else {
          this.bot.sendMessage(chatId, 'Please enter a valid city.');
        }
      });
    });

    this.bot.onText(/\/unsubscribe/, async (msg) => {
      const chatId = msg.chat.id;
      const user = await this.userService.findByChatId(chatId);
      if (user) {
        const updateUserDto: UpdateUserDto = {
          chatId,
          isBlocked: true,
          updatedAt: new Date(),
        };
        await this.userService.update(chatId, updateUserDto);
        this.bot.sendMessage(
          chatId,
          'You have been unsubscribed from weather updates.',
        );
      } else {
        this.bot.sendMessage(
          chatId,
          'You are not subscribed to weather updates.',
        );
      }
    });
  }

  private async sendWeatherUpdateToAll() {
    const users: User[] = await this.userService.findUnblockedUsers();
    for (const user of users) {
      if (user.isBlocked === false && user.city) {
        await this.sendWeatherUpdate(user.chatId, user.city);
      }
    }
  }

  private async sendWeatherUpdate(chatId: number, city: string) {
    const apiKey = '314b2a3eac6bafc109b234ea1bb20b88';

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`,
      );

      if (!response.ok) {
        console.log('Failed to fetch weather data');
        this.bot.sendMessage(
          chatId,
          'Unable to fetch weather data. Please try again later.',
        );
        return;
      }

      const data: WeatherResponse = (await response.json()) as WeatherResponse;

      const weatherDescription =
        data.weather[0]?.description || 'No description';
      const temperature = (data.main?.temp - 273.15)?.toFixed(2) || 'N/A';
      const feelsLike = (data.main?.feels_like - 273.15)?.toFixed(2) || 'N/A';
      const tempMin = (data.main?.temp_min - 273.15)?.toFixed(2) || 'N/A';
      const tempMax = (data.main?.temp_max - 273.15)?.toFixed(2) || 'N/A';
      const pressure = data.main?.pressure || 'N/A';
      const humidity = data.main?.humidity || 'N/A';
      const windSpeed = data.wind?.speed || 'N/A';
      const windDirection = data.wind?.deg || 'N/A';
      const visibility = data.visibility || 'N/A';
      const sunrise =
        new Date(data.sys?.sunrise * 1000).toLocaleTimeString() || 'N/A';
      const sunset =
        new Date(data.sys?.sunset * 1000).toLocaleTimeString() || 'N/A';

      const message = `
  Weather in ${city}:
  - Description: ${weatherDescription}
  - Temperature: ${temperature}°C
  - Feels Like: ${feelsLike}°C
  - Min Temp: ${tempMin}°C
  - Max Temp: ${tempMax}°C
  - Humidity: ${humidity}%
  - Pressure: ${pressure} hPa
  - Wind Speed: ${windSpeed} m/s
  - Wind Direction: ${windDirection}°
  - Visibility: ${visibility} meters
  - Sunrise: ${sunrise}
  - Sunset: ${sunset}
      `;

      this.bot.sendMessage(chatId, message.trim());
    } catch (error) {
      console.error('Error fetching weather data', error);
      this.bot.sendMessage(
        chatId,
        'An error occurred while fetching weather data.',
      );
    }
  }

  @OnEvent('apiKeyUpdated')
  async handleTokenUpdate(newToken: string) {
    this.initializeBot(newToken);
  }
}
