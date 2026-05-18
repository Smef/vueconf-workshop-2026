import { usePreferredDark } from "@vueuse/core";

const systemDark = usePreferredDark();

export function useDarkMode() {
    const preference = useCookie<boolean | null>("dark-mode", { default: () => null });

    const isDark = computed(() => preference.value ?? systemDark.value);

    function toggle() {
        preference.value = !isDark.value;
    }

    return { isDark, toggle };
}
