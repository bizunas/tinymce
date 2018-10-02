import { Option, Arr } from '@ephox/katamari';
import { updateMenuText } from '../../dropdown/CommonDropdown';
import { AlloyTriggers } from '@ephox/alloy';
import { createSelectButton } from './BespokeSelect';
import { buildBasicSettingsDataset, Delimiter } from './SelectDatasets';

const defaultFontsizeFormats = '8pt 10pt 12pt 14pt 18pt 24pt 36pt';

const round = (number: number, precision: number) => {
  const factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
};

const toPt = (fontSize: string, precision?: number) => {
  if (/[0-9.]+px$/.test(fontSize)) {
    // Round to the nearest 0.5
    return round(parseInt(fontSize, 10) * 72 / 96, precision || 0) + 'pt';
  }
  return fontSize;
};

const createFontsizeSelect = (editor, backstage) => {
  const getMatchingValue = () => {
    let matchOpt = Option.none();
    const items = dataset.data;

    const px = editor.queryCommandValue('FontSize');
    if (px) {
      // checking for three digits after decimal point, should be precise enough
      for (let precision = 3; matchOpt.isNone() && precision >= 0; precision--) {
        const pt = toPt(px, precision);
        matchOpt = Arr.find(items, (item) => item.format === px || item.format === pt);
      }
    }

    return { matchOpt, px };
  };

  const isSelectedFor = (item) => {
    return () => {
      const { matchOpt } = getMatchingValue();
      return matchOpt.exists((match) => match.format === item);
    };
  };

  const getPreviewFor = () => () => {
    return Option.none();
  };

  const onAction = (rawItem) => () => {
    editor.undoManager.transact(() => {
      editor.focus();
      editor.execCommand('FontSize', false, rawItem.format);
    });
  };

  const nodeChangeHandler = Option.some((comp) => {
    return () => {
      const { matchOpt, px } = getMatchingValue();

      const text = matchOpt.fold(() => px, (match) => match.title);
      AlloyTriggers.emitWith(comp, updateMenuText, {
        text
      });
    };
  });

  const dataset = buildBasicSettingsDataset(editor, 'fontsize_formats', defaultFontsizeFormats, Delimiter.Space);

  return createSelectButton(editor, backstage, dataset, {
    isSelectedFor,
    getPreviewFor,
    onAction,
    nodeChangeHandler
  });
};

export {
  createFontsizeSelect
};