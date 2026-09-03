import ButtonWithIcon from './ButtonWithIcon.svelte';

import { action } from '@storybook/addon-actions';




export const actionsData = {
  onPinButtonWithIcon: action('onPinButtonWithIcon'),
  onArchiveButtonWithIcon: action('onArchiveButtonWithIcon'),
};

export default {
  component: ButtonWithIcon,
  title: 'ButtonWithIcon',
  excludeStories: /.*Data$/,
  //👇 The argTypes are included so that they are properly displayed in the Actions Panel
  argTypes: {
    onPinButtonWithIcon: { action: 'onPinButtonWithIcon' },
    onArchiveButtonWithIcon: { action: 'onArchiveButtonWithIcon' },
  },
};

const Template = ({ onArchiveButtonWithIcon, onPinButtonWithIcon, ...args }) => ({
  Component: ButtonWithIcon,
  props: args,
  on: {
    ...actionsData,
  },
});

export const Default = Template.bind({});
Default.args = {
  task: {
    id: '1',
    title: 'Test ButtonWithIcon',
    state: 'TASK_INBOX',
  },
};
export const Pinned = Template.bind({});
Pinned.args = {
  task: {
    ...Default.args.task,
	title: 'Test ButtonWithIcon2',
    state: 'TASK_PINNED',
  },
};

export const Archived = Template.bind({});
Archived.args = {
  task: {
    ...Default.args.task,
	title: 'Test ButtonWithIcon3',
    state: 'TASK_ARCHIVED',
  },
};