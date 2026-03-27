'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { translations, Locale } from '@/lib/translations';
import {
  Calculator,
  Home,
  Droplets,
  Box,
  Grid3X3,
  Paintbrush,
  ArrowLeftRight,
  ChevronLeft,
  Layers,
  Ruler,
  Scale,
  Container,
} from 'lucide-react';

interface CalculatorSectionProps {
  onBack?: () => void;
}

// Calculator types
type CalculatorType = 'concrete' | 'steel' | 'bricks' | 'tiles' | 'paint' | 'units';

// Calculator definitions with icons and colors
const CALCULATOR_CONFIG = {
  concrete: { icon: Droplets, color: 'bg-blue-500' },
  steel: { icon: Box, color: 'bg-slate-600' },
  bricks: { icon: Layers, color: 'bg-orange-500' },
  tiles: { icon: Grid3X3, color: 'bg-cyan-500' },
  paint: { icon: Paintbrush, color: 'bg-purple-500' },
  units: { icon: ArrowLeftRight, color: 'bg-green-500' },
};

export function CalculatorSection({ onBack }: CalculatorSectionProps) {
  const { locale } = useAppStore();
  const isRTL = locale === 'ar';
  const t = translations.calculatorSection;
  const [activeCalc, setActiveCalc] = useState<CalculatorType | null>(null);

  // Render calculator selection
  if (!activeCalc) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              {t.title[locale]}
            </h1>
            <p className="text-muted-foreground">
              {t.subtitle[locale]}
            </p>
          </div>
          {onBack && (
            <Button variant="default" onClick={onBack} className="gap-2">
              <Home className="h-4 w-4" />
              {translations.home[locale]}
            </Button>
          )}
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(CALCULATOR_CONFIG) as CalculatorType[]).map((calcId) => {
            const config = CALCULATOR_CONFIG[calcId];
            const calc = t.calculators[calcId];
            return (
              <Card 
                key={calcId}
                className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
                onClick={() => setActiveCalc(calcId)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn('p-3 rounded-xl text-white', config.color)}>
                      <config.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        {calc[locale]}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {calc.description[locale]}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Render specific calculator
  const renderCalculator = () => {
    switch (activeCalc) {
      case 'concrete':
        return <ConcreteCalculator locale={locale} />;
      case 'steel':
        return <SteelCalculator locale={locale} />;
      case 'bricks':
        return <BricksCalculator locale={locale} />;
      case 'tiles':
        return <TilesCalculator locale={locale} />;
      case 'paint':
        return <PaintCalculator locale={locale} />;
      case 'units':
        return <UnitConverter locale={locale} />;
      default:
        return null;
    }
  };

  const currentConfig = CALCULATOR_CONFIG[activeCalc];
  const currentCalc = t.calculators[activeCalc];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setActiveCalc(null)} className="gap-2">
          <ChevronLeft className={isRTL ? "rotate-180" : ""} />
          {translations.backToList[locale]}
        </Button>
        {onBack && (
          <Button variant="default" onClick={onBack} className="gap-2">
            <Home className="h-4 w-4" />
            {translations.home[locale]}
          </Button>
        )}
      </div>

      {/* Calculator Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg text-white', currentConfig.color)}>
              <currentConfig.icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>{currentCalc[locale]}</CardTitle>
              <CardDescription>{currentCalc.description[locale]}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calculator Content */}
      {renderCalculator()}
    </div>
  );
}

// Concrete Calculator Component
function ConcreteCalculator({ locale }: { locale: Locale }) {
  const t = translations.calculatorSection;
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const volume = l * w * h;
    setResult(volume);
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t.length[locale]}</Label>
            <Input 
              type="number" 
              value={length} 
              onChange={(e) => setLength(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label>{t.width[locale]}</Label>
            <Input 
              type="number" 
              value={width} 
              onChange={(e) => setWidth(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label>{t.height[locale]}</Label>
            <Input 
              type="number" 
              value={height} 
              onChange={(e) => setHeight(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <Button onClick={calculate} className="w-full gap-2">
          <Calculator className="h-4 w-4" />
          {(t as any).calculate?.[locale] || translations.calculate[locale]}
        </Button>

        {result !== null && (
          <div className="bg-primary/5 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-center gap-4">
              <Container className="h-8 w-8 text-primary" />
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {result.toFixed(2)} م³
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.concreteVolume[locale]}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-xl font-bold">{(result * 350).toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">
                  {t.cementKg[locale]}
                </p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-xl font-bold">{(result * 0.8).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {t.sandM3[locale]}
                </p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-xl font-bold">{(result * 0.9).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {t.gravelM3[locale]}
                </p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-xl font-bold">{(result * 180).toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">
                  {t.waterL[locale]}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Steel Calculator Component
function SteelCalculator({ locale }: { locale: Locale }) {
  const t = translations.calculatorSection;
  const [diameter, setDiameter] = useState('');
  const [length, setLength] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [result, setResult] = useState<{ weight: number; totalWeight: number } | null>(null);

  const calculate = () => {
    const d = parseFloat(diameter) || 0;
    const l = parseFloat(length) || 0;
    const q = parseFloat(quantity) || 1;
    
    // Weight = (D² × L) / 162 (formula for steel bars in kg)
    const weightPerBar = (d * d * l) / 162;
    const totalWeight = weightPerBar * q;
    
    setResult({ weight: weightPerBar, totalWeight });
  };

  const steelGrades = [
    { diameter: 8, name: 'Φ8' },
    { diameter: 10, name: 'Φ10' },
    { diameter: 12, name: 'Φ12' },
    { diameter: 14, name: 'Φ14' },
    { diameter: 16, name: 'Φ16' },
    { diameter: 20, name: 'Φ20' },
    { diameter: 25, name: 'Φ25' },
    { diameter: 32, name: 'Φ32' },
  ];

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {/* Quick Select Diameter */}
        <div className="space-y-2">
          <Label>{locale === 'ar' ? 'قطر الحديد' : "Diamètre de l'acier"}</Label>
          <div className="flex flex-wrap gap-2">
            {steelGrades.map((grade) => (
              <Button
                key={grade.diameter}
                variant={diameter === grade.diameter.toString() ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDiameter(grade.diameter.toString())}
              >
                {grade.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t.diameter[locale]}</Label>
            <Input 
              type="number" 
              value={diameter} 
              onChange={(e) => setDiameter(e.target.value)}
              placeholder="12"
            />
          </div>
          <div className="space-y-2">
            <Label>{t.steelLength[locale]}</Label>
            <Input 
              type="number" 
              value={length} 
              onChange={(e) => setLength(e.target.value)}
              placeholder="12"
            />
          </div>
          <div className="space-y-2">
            <Label>{t.quantity[locale]}</Label>
            <Input 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
            />
          </div>
        </div>

        <Button onClick={calculate} className="w-full gap-2">
          <Calculator className="h-4 w-4" />
          {translations.calculate[locale]}
        </Button>

        {result && (
          <div className="bg-primary/5 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-background rounded-lg">
                <Scale className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{result.weight.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  {t.weightPerBar[locale]}
                </p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <Box className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold text-primary">{result.totalWeight.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  {t.totalWeight[locale]}
                </p>
              </div>
            </div>
            
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {t.steelFormula[locale]}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Bricks Calculator Component
function BricksCalculator({ locale }: { locale: Locale }) {
  const t = translations.calculatorSection;
  const [wallLength, setWallLength] = useState('');
  const [wallHeight, setWallHeight] = useState('');
  const [brickType, setBrickType] = useState('standard');
  const [result, setResult] = useState<{ bricks: number; mortar: number; area: number } | null>(null);

  const brickTypes = [
    { id: 'standard', size: 0.1 },
    { id: 'hollow', size: 0.06 },
    { id: 'block', size: 0.125 },
  ];

  const calculate = () => {
    const l = parseFloat(wallLength) || 0;
    const h = parseFloat(wallHeight) || 0;
    const selectedBrick = brickTypes.find(b => b.id === brickType);
    
    const area = l * h;
    const bricksPerM2 = 1 / (selectedBrick?.size || 0.1);
    const bricks = Math.ceil(area * bricksPerM2 * 1.05); // 5% waste
    const mortar = area * 0.025; // ~25L mortar per m²
    
    setResult({ bricks, mortar, area });
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t.wallLength[locale]}</Label>
            <Input 
              type="number" 
              value={wallLength} 
              onChange={(e) => setWallLength(e.target.value)}
              placeholder="10"
            />
          </div>
          <div className="space-y-2">
            <Label>{t.wallHeight[locale]}</Label>
            <Input 
              type="number" 
              value={wallHeight} 
              onChange={(e) => setWallHeight(e.target.value)}
              placeholder="3"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t.brickType[locale]}</Label>
          <div className="flex flex-wrap gap-2">
            {(['standard', 'hollow', 'block'] as const).map((type) => (
              <Button
                key={type}
                variant={brickType === type ? 'default' : 'outline'}
                onClick={() => setBrickType(type)}
              >
                {t.brickTypes[type][locale]}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={calculate} className="w-full gap-2">
          <Calculator className="h-4 w-4" />
          {translations.calculate[locale]}
        </Button>

        {result && (
          <div className="bg-primary/5 rounded-lg p-6 space-y-4">
            <div className="text-center pb-4 border-b">
              <p className="text-xl font-bold">{result.area.toFixed(2)} م²</p>
              <p className="text-sm text-muted-foreground">
                {t.wallArea[locale]}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-background rounded-lg">
                <Layers className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold text-primary">{result.bricks}</p>
                <p className="text-sm text-muted-foreground">
                  {t.bricksCount[locale]}
                </p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <Droplets className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{result.mortar.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">
                  {t.mortarLiters[locale]}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Tiles Calculator Component
function TilesCalculator({ locale }: { locale: Locale }) {
  const t = translations.calculatorSection;
  const [roomLength, setRoomLength] = useState('');
  const [roomWidth, setRoomWidth] = useState('');
  const [tileSize, setTileSize] = useState('60x60');
  const [result, setResult] = useState<{ tiles: number; area: number; boxes: number } | null>(null);

  const tileSizes = [
    { id: '30x30', area: 0.09 },
    { id: '60x60', area: 0.36 },
    { id: '80x80', area: 0.64 },
    { id: '100x100', area: 1 },
    { id: '30x60', area: 0.18 },
    { id: '45x90', area: 0.405 },
  ];

  const calculate = () => {
    const l = parseFloat(roomLength) || 0;
    const w = parseFloat(roomWidth) || 0;
    const selectedTile = tileSizes.find(t => t.id === tileSize);
    
    const area = l * w;
    const tilesPerM2 = 1 / (selectedTile?.area || 0.36);
    const tiles = Math.ceil(area * tilesPerM2 * 1.1); // 10% waste
    const boxes = Math.ceil(tiles / 4); // Assuming 4 tiles per box
    
    setResult({ tiles, area, boxes });
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t.roomLength[locale]}</Label>
            <Input 
              type="number" 
              value={roomLength} 
              onChange={(e) => setRoomLength(e.target.value)}
              placeholder="5"
            />
          </div>
          <div className="space-y-2">
            <Label>{t.roomWidth[locale]}</Label>
            <Input 
              type="number" 
              value={roomWidth} 
              onChange={(e) => setRoomWidth(e.target.value)}
              placeholder="4"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t.tileSize[locale]}</Label>
          <div className="flex flex-wrap gap-2">
            {tileSizes.map((size) => (
              <Button
                key={size.id}
                variant={tileSize === size.id ? 'default' : 'outline'}
                onClick={() => setTileSize(size.id)}
              >
                {size.id === '30x30' && '30×30 '}
                {size.id === '60x60' && '60×60 '}
                {size.id === '80x80' && '80×80 '}
                {size.id === '100x100' && '100×100 '}
                {size.id === '30x60' && '30×60 '}
                {size.id === '45x90' && '45×90 '}
                {locale === 'ar' ? 'سم' : 'cm'}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={calculate} className="w-full gap-2">
          <Calculator className="h-4 w-4" />
          {translations.calculate[locale]}
        </Button>

        {result && (
          <div className="bg-primary/5 rounded-lg p-6 space-y-4">
            <div className="text-center pb-4 border-b">
              <p className="text-xl font-bold">{result.area.toFixed(2)} م²</p>
              <p className="text-sm text-muted-foreground">
                {t.totalArea[locale]}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-background rounded-lg">
                <Grid3X3 className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold text-primary">{result.tiles}</p>
                <p className="text-sm text-muted-foreground">
                  {t.tilesCount[locale]}
                </p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <Box className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{result.boxes}</p>
                <p className="text-sm text-muted-foreground">
                  {t.boxesCount[locale]}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Paint Calculator Component
function PaintCalculator({ locale }: { locale: Locale }) {
  const t = translations.calculatorSection;
  const [roomLength, setRoomLength] = useState('');
  const [roomWidth, setRoomWidth] = useState('');
  const [roomHeight, setRoomHeight] = useState('');
  const [coats, setCoats] = useState('2');
  const [doorsWindows, setDoorsWindows] = useState('0');
  const [result, setResult] = useState<{ liters: number; area: number; buckets: number } | null>(null);

  const calculate = () => {
    const l = parseFloat(roomLength) || 0;
    const w = parseFloat(roomWidth) || 0;
    const h = parseFloat(roomHeight) || 0;
    const c = parseFloat(coats) || 2;
    const dw = parseFloat(doorsWindows) || 0;
    
    // Wall area (perimeter × height)
    const perimeter = 2 * (l + w);
    const wallArea = perimeter * h;
    
    // Subtract doors/windows (estimate 2m² each)
    const netArea = wallArea - (dw * 2);
    
    // Paint needed (1L covers ~10m² for one coat)
    const liters = Math.ceil((netArea * c) / 10);
    const buckets = Math.ceil(liters / 18); // 18L buckets
    
    setResult({ liters, area: netArea, buckets });
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t.roomLength[locale]}</Label>
            <Input 
              type="number" 
              value={roomLength} 
              onChange={(e) => setRoomLength(e.target.value)}
              placeholder="5"
            />
          </div>
          <div className="space-y-2">
            <Label>{t.roomWidth[locale]}</Label>
            <Input 
              type="number" 
              value={roomWidth} 
              onChange={(e) => setRoomWidth(e.target.value)}
              placeholder="4"
            />
          </div>
          <div className="space-y-2">
            <Label>{t.height[locale]}</Label>
            <Input 
              type="number" 
              value={roomHeight} 
              onChange={(e) => setRoomHeight(e.target.value)}
              placeholder="3"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t.coats[locale]}</Label>
            <div className="flex gap-2">
              {['1', '2', '3'].map((num) => (
                <Button
                  key={num}
                  variant={coats === num ? 'default' : 'outline'}
                  onClick={() => setCoats(num)}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t.doorsWindows[locale]}</Label>
            <Input 
              type="number" 
              value={doorsWindows} 
              onChange={(e) => setDoorsWindows(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <Button onClick={calculate} className="w-full gap-2">
          <Calculator className="h-4 w-4" />
          {translations.calculate[locale]}
        </Button>

        {result && (
          <div className="bg-primary/5 rounded-lg p-6 space-y-4">
            <div className="text-center pb-4 border-b">
              <p className="text-xl font-bold">{result.area.toFixed(2)} م²</p>
              <p className="text-sm text-muted-foreground">
                {t.netArea[locale]}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-background rounded-lg">
                <Paintbrush className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold text-primary">{result.liters}</p>
                <p className="text-sm text-muted-foreground">
                  {t.paintLiters[locale]}
                </p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <Box className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{result.buckets}</p>
                <p className="text-sm text-muted-foreground">
                  {t.bucket18L[locale]}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Unit Converter Component
function UnitConverter({ locale }: { locale: Locale }) {
  const t = translations.calculatorSection;
  const [category, setCategory] = useState<'length' | 'area' | 'volume' | 'weight'>('length');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [value, setValue] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const UNIT_DATA = {
    length: {
      units: [
        { id: 'mm', factor: 0.001 },
        { id: 'cm', factor: 0.01 },
        { id: 'm', factor: 1 },
        { id: 'km', factor: 1000 },
      ],
    },
    area: {
      units: [
        { id: 'cm2', factor: 0.0001 },
        { id: 'm2', factor: 1 },
        { id: 'are', factor: 100 },
        { id: 'hectare', factor: 10000 },
      ],
    },
    volume: {
      units: [
        { id: 'cm3', factor: 0.000001 },
        { id: 'liter', factor: 0.001 },
        { id: 'm3', factor: 1 },
      ],
    },
    weight: {
      units: [
        { id: 'g', factor: 0.001 },
        { id: 'kg', factor: 1 },
        { id: 'ton', factor: 1000 },
      ],
    },
  };

  const categoryIcons = {
    length: Ruler,
    area: Grid3X3,
    volume: Container,
    weight: Scale,
  };

  const currentUnits = UNIT_DATA[category].units;

  const convert = () => {
    const from = currentUnits.find(u => u.id === fromUnit);
    const to = currentUnits.find(u => u.id === toUnit);
    const inputValue = parseFloat(value) || 0;

    if (from && to) {
      // Convert to base unit, then to target unit
      const baseValue = inputValue * from.factor;
      const convertedValue = baseValue / to.factor;
      setResult(convertedValue);
    }
  };

  const Icon = categoryIcons[category];

  return (
    <div className="space-y-4">
      {/* Category Selection */}
      <div className="flex flex-wrap gap-2">
        {(['length', 'area', 'volume', 'weight'] as const).map((cat) => {
          const CatIcon = categoryIcons[cat];
          return (
            <Button
              key={cat}
              variant={category === cat ? 'default' : 'outline'}
              onClick={() => {
                setCategory(cat);
                setFromUnit('');
                setToUnit('');
                setResult(null);
              }}
              className="gap-2"
            >
              <CatIcon className="h-4 w-4" />
              {t.unitCategories[cat][locale]}
            </Button>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>{t.value[locale]}</Label>
            <Input 
              type="number" 
              value={value} 
              onChange={(e) => setValue(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.fromUnit[locale]}</Label>
              <div className="flex flex-wrap gap-2">
                {currentUnits.map((unit) => (
                  <Button
                    key={unit.id}
                    variant={fromUnit === unit.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFromUnit(unit.id)}
                  >
                    {t.units[unit.id][locale]}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.toUnit[locale]}</Label>
              <div className="flex flex-wrap gap-2">
                {currentUnits.map((unit) => (
                  <Button
                    key={unit.id}
                    variant={toUnit === unit.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setToUnit(unit.id)}
                  >
                    {t.units[unit.id][locale]}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={convert} className="w-full gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            {translations.convert[locale]}
          </Button>

          {result !== null && (
            <div className="bg-primary/5 rounded-lg p-6 text-center">
              <Icon className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-3xl font-bold text-primary">
                {result.toFixed(4)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t.result[locale]}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CalculatorSection;
