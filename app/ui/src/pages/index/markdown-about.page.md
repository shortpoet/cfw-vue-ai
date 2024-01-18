<script setup>
import Counter from '../../components/base/Counter.vue'

// using the `name` variable in the template
// causes a hyrdation mismatch
const name = 'Markdown'

</script>

# Markdown

This page is written in _Markdown_.


Interactive components can be included in the Markdown. <Counter/>
