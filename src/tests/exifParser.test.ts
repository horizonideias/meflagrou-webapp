import { describe, it, expect } from 'vitest';
import { exifParserService } from '../services/exifParserService';

describe('Pilar 5: Smart EXIF & Camera Metadata Parser', () => {
  it('should extract Sony Alpha 7R V camera preset from file', async () => {
    const exif = await exifParserService.extractExifFromBlob({ name: 'DSC00421.JPG' });
    expect(exif.camera).toContain('Sony');
    expect(exif.iso).toBeDefined();
    expect(exif.shutter).toBeDefined();
    expect(exif.aperture).toBeDefined();
  });

  it('should detect Canon EOS R5 from canon filenames', async () => {
    const exif = await exifParserService.extractExifFromBlob({ name: 'IMG_CANON_8892.CR3' });
    expect(exif.camera).toContain('Canon');
    expect(exif.lens).toContain('85mm');
  });

  it('should detect Nikon Z8 from nef filenames', async () => {
    const exif = await exifParserService.extractExifFromBlob({ name: '_DSC9021.NEF' });
    expect(exif.camera).toContain('Nikon');
    expect(exif.lens).toContain('35mm');
  });
});
