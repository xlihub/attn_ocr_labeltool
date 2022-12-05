import React, { PureComponent, Component } from 'react';
import { Radio, Select, Button, Loader } from 'semantic-ui-react';

const defaultStyle = {
  width: '100%',
  background: '#fcfcfc',
  minHeight: 40,
  borderBottom: '1px solid #ccc',
  padding: '10px 15px',
};

const smoothingOptions = [
  { value: 0.3, text: 'Slight' },
  { value: 0.6, text: 'Normal' },
  { value: 1.2, text: 'Strong' },
  { value: 1.6, text: 'Extreme' },
];

const precisionOptions = [
  { value: 0, text: '1x1' },
  { value: 1, text: '3x3' },
  { value: 2, text: '5x5' },
];

const selectStyle = {
  marginLeft: 10,
};

const groupStyle = {
  marginLeft: 20,
};

export class PathToolbar extends PureComponent {
  render() {
    const { style, enabled, smoothing, precision, onChange } = this.props;
    const disabled = !enabled;
    const selectProps = {
      compact: true,
      disabled,
      style: selectStyle,
      onChange: (e, { name, value }) => onChange(name, value),
    };

    return (
      <div style={{ ...style, ...defaultStyle }}>
        <Radio
          label="Auto-tracing"
          toggle
          checked={enabled}
          onChange={(e, { checked }) => onChange('enabled', checked)}
        />
        <span style={{ marginLeft: 100 }}>
          <span style={groupStyle}>
            Smoothing:
            <Select
              {...selectProps}
              name="smoothing"
              value={smoothing}
              options={smoothingOptions}
            />
          </span>
          <span style={groupStyle}>
            Anchor precision:
            <Select
              {...selectProps}
              name="precision"
              value={precision}
              options={precisionOptions}
            />
          </span>
        </span>
      </div>
    );
  }
}

const predictionSmoothingOptions = [
  { value: 1.0, text: 'Slight' },
  { value: 2.5, text: 'Normal' },
  { value: 5.0, text: 'Strong' },
  { value: 10.0, text: 'Extreme' },
];

let lastSelected = {};
export class MakePredictionToolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      model: lastSelected.model || props.models[0].id,
      smoothing: lastSelected.smoothing || predictionSmoothingOptions[1].value,
      loading: false,
    };
  }

  async handleGenerate(model, smoothing) {
    this.setState({ loading: true });
    await this.props.generate(model, { smoothing });
    this.setState({ loading: false });
  }

  render() {
    const { style, models } = this.props;
    const { model, smoothing, loading } = this.state;

    const selectProps = {
      style: selectStyle,
      onChange: (e, { name, value }) => {
        this.setState({ [name]: value });
        lastSelected[name] = value;
      },
    };

    const options = models.map(({ id, name }) => ({ value: id, text: name }));
    const m = models.find(m => m.id === model);

    const smoothingSelect =
      m.type === 'semantic_segmentation' ? (
        <span style={groupStyle}>
          Smoothing:
          <Select
            {...selectProps}
            name="smoothing"
            value={smoothing}
            options={predictionSmoothingOptions}
          />
        </span>
      ) : null;

    const disabled = m.type === 'object_classification';
    const text = disabled
      ? 'This model can only be used to generate general tags for text fields.'
      : null;

    return (
      <div style={{ ...style, ...defaultStyle }}>
        <span style={groupStyle}>
          Generate selections using a model
          <Select
            {...selectProps}
            name="model"
            value={model}
            options={options}
          />
        </span>
        {smoothingSelect}
        <span style={groupStyle}>
          <Button
            disabled={disabled}
            onClick={() => this.handleGenerate(m, smoothing)}
          >
            Generate
          </Button>
          <Loader active={loading} inline />
          <span>{text}</span>
        </span>
      </div>
    );
  }
}
