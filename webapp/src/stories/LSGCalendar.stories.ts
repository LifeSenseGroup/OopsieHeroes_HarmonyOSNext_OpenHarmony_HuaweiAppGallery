import LSGCalendar from ./LSGCalendar.svelte
import { Story, Meta } from '@storybook/web-components';

export default {
  title: 'Example/LSGCalendar',
  component: LSGCalendar
} as Meta;

export const Primary: Story<LSGCalendar> = () => LSGCalendar();


