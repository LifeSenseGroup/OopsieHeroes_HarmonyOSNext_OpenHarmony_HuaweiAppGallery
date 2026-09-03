<script>

	import Hamburger from './Hamburger.svelte'

	
	export let sidebar = false
</script>


	<nav >
		<Hamburger bind:open={sidebar}/>

	</nav>
	
