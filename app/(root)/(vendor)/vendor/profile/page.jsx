'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function VendorProfilePage() {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get('/api/vendor/profile', { headers: { 'Cache-Control': 'no-cache' } })
            if (data.success) {
                setProfile(data.data)
            }
        } catch (e) {
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-6">Loading...</div>
    if (!profile) return <div className="p-6">No profile found.</div>

    const v = profile.vendor

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <Card>
                <CardHeader>
                    <CardTitle>{v.businessName}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                        <div>
                            <div className="text-sm text-gray-600">Type</div>
                            <div className="text-sm">{v.businessType}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Status</div>
                            <div className="text-sm">{v.status} / {v.verificationStatus}</div>
                        </div>
                        <div className="md:col-span-2">
                            <div className="text-sm text-gray-600">Address</div>
                            <div className="text-sm whitespace-pre-line">{`${v.businessAddress?.houseApartment}, ${v.businessAddress?.roadStreet}
${v.businessAddress?.areaLocality}
${v.businessAddress?.postOffice}, ${v.businessAddress?.upazilaThana}
${v.businessAddress?.district}, ${v.businessAddress?.postcode}
${v.businessAddress?.country || 'Bangladesh'}`}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}


