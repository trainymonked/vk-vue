<script setup>
const props = defineProps({
    data: Array[Object],
})

const { data: attachments } = props
</script>

<template>
    <div class="flex flex-col justify-normal gap-2">
        <div v-for="att in attachments">
            <img
                v-if="att.type === 'photo'"
                :src="att.photo?.sizes[3].url"
                :width="att.photo?.sizes[3].width"
                :height="att.photo?.sizes[3].height"
            />
            <div
                v-else-if="att.type === 'video'"
                class="text-white font-bold"
                :style="{
                    'background-image': `url(${att.video.image[1].url})`,
                    'background-repeat': 'no-repeat',
                    'min-width': att.video.image[1].width + 'px',
                    height: att.video.image[1].height + 'px',
                }"
            >
                Видео
            </div>
            <a v-else-if="att.type === 'link'" target="_blank" :href="att.link.url">{{ att.link.url }}</a>
            <div class="bg-red-500" v-else>/// {{ att.type }} ///</div>
        </div>
    </div>
</template>
