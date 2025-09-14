'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

export default function VendorSettingsPage() {
    const [settings, setSettings] = useState({ autoAcceptOrders: true, notificationEmail: true, notificationSMS: true })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        ;(async () => {
            try {
                const { data } = await axios.get('/api/vendor/profile')
                if (data.success) {
                    setSettings(data.data.vendor?.settings || settings)
                }
            } catch {}
        })()
    }, [])

    const save = async () => {
        try {
            setSaving(true)
            await axios.put('/api/vendor/profile', { settings })
        } catch {}
        finally { setSaving(false) }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Settings</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Operational Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Auto-accept orders</div>
                            <div className="text-sm text-gray-600">Automatically accept incoming orders</div>
                        </div>
                        <Switch checked={settings.autoAcceptOrders} onCheckedChange={(v) => setSettings({ ...settings, autoAcceptOrders: v })} />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Email notifications</div>
                            <div className="text-sm text-gray-600">Get notified about orders via email</div>
                        </div>
                        <Switch checked={settings.notificationEmail} onCheckedChange={(v) => setSettings({ ...settings, notificationEmail: v })} />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">SMS notifications</div>
                            <div className="text-sm text-gray-600">Get notified about orders via SMS</div>
                        </div>
                        <Switch checked={settings.notificationSMS} onCheckedChange={(v) => setSettings({ ...settings, notificationSMS: v })} />
                    </div>
                    <div className="pt-2">
                        <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}


