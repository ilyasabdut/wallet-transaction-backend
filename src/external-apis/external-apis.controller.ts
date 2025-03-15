import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiOkResponse } from '@nestjs/swagger';
import { SkipAuth } from '../helper/helper';

@SkipAuth()
@Controller('external/covid')
export class ExternalApisController {
  @Get()
  @ApiOkResponse({ isArray: true })
  async getCovid(@Res() res: Response) {
    try {
      const response = await fetch("https://dekontaminasi.com/api/id/covid19/stats");

      if (!response.ok) {
        return res.status(response.status).json({ message: "Failed to fetch data" });
      }

      const data = await response.json();
      return res.status(HttpStatus.OK).json(data);
    } catch (error) {
      console.error("Error fetching COVID data:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
}
