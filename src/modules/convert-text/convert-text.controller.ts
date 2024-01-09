import { Body, Controller, Post } from '@nestjs/common';
import { ConvertTextService } from './convert-text.service';
import { TranslateReqDto } from './dto/translateSessionReq.dto';

@Controller('')
export class ConvertTextController {
  constructor(private ConvertTextService: ConvertTextService) {}

  @Post('/convert-to-vi')
  async translate(@Body() translateReqDto: TranslateReqDto) {
    console.log({ translateReqDto });
    return await this.ConvertTextService.convertLanguage(
      translateReqDto.session_id,
    );
  }

  @Post('/translate-text')
  async translateText(@Body() body) {
    const { text, currentLang } = body;
    return await this.ConvertTextService.translateText(text, currentLang);
  }
}
